import Geolocation from '@react-native-community/geolocation';
import BackgroundJob from 'react-native-background-job';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, PermissionsAndroid } from 'react-native';

export interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  altitude?: number;
  speed?: number;
  heading?: number;
}

export interface Geofence {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  isActive: boolean;
}

class LocationServiceClass {
  private watchId: number | null = null;
  private geofences: Geofence[] = [];
  private currentLocation: Location | null = null;
  private locationUpdateCallbacks: ((location: Location) => void)[] = [];
  private geofenceCallbacks: ((geofence: Geofence, isEntering: boolean) => void)[] = [];
  private isBackgroundTracking = false;

  async initialize(): Promise<void> {
    try {
      await this.requestLocationPermissions();
      await this.loadGeofences();
      this.setupLocationTracking();
    } catch (error) {
      console.error('LocationService initialization error:', error);
      throw error;
    }
  }

  private async requestLocationPermissions(): Promise<void> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        ]);

        const fineLocationGranted = granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED;
        const coarseLocationGranted = granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED;

        if (!fineLocationGranted && !coarseLocationGranted) {
          throw new Error('Location permissions not granted');
        }
      } catch (error) {
        console.error('Permission request error:', error);
        throw error;
      }
    }
  }

  private setupLocationTracking(): void {
    Geolocation.getCurrentPosition(
      (position) => {
        this.updateCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          altitude: position.coords.altitude || undefined,
          speed: position.coords.speed || undefined,
          heading: position.coords.heading || undefined,
        });
      },
      (error) => {
        console.error('Initial location error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  }

  async getCurrentPosition(): Promise<Location> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            altitude: position.coords.altitude || undefined,
            speed: position.coords.speed || undefined,
            heading: position.coords.heading || undefined,
          };
          this.updateCurrentLocation(location);
          resolve(location);
        },
        (error) => {
          console.error('Get current position error:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  startLocationUpdates(options?: {
    interval?: number;
    fastestInterval?: number;
    enableHighAccuracy?: boolean;
  }): void {
    const defaultOptions = {
      interval: 10000, // 10 seconds
      fastestInterval: 5000, // 5 seconds
      enableHighAccuracy: true,
      ...options,
    };

    this.watchId = Geolocation.watchPosition(
      (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          altitude: position.coords.altitude || undefined,
          speed: position.coords.speed || undefined,
          heading: position.coords.heading || undefined,
        };
        this.updateCurrentLocation(location);
      },
      (error) => {
        console.error('Location watch error:', error);
      },
      {
        enableHighAccuracy: defaultOptions.enableHighAccuracy,
        timeout: 15000,
        maximumAge: 10000,
        distanceFilter: 10, // Update every 10 meters
      }
    );
  }

  stopLocationUpdates(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  startBackgroundTracking(): void {
    if (this.isBackgroundTracking) return;

    BackgroundJob.start({
      jobKey: 'locationTracking',
      period: 30000, // 30 seconds
    });

    this.isBackgroundTracking = true;
  }

  stopBackgroundTracking(): void {
    if (!this.isBackgroundTracking) return;

    BackgroundJob.stop({
      jobKey: 'locationTracking',
    });

    this.isBackgroundTracking = false;
  }

  private updateCurrentLocation(location: Location): void {
    this.currentLocation = location;
    
    // Store location for offline access
    this.storeLocationOffline(location);
    
    // Notify callbacks
    this.locationUpdateCallbacks.forEach(callback => {
      try {
        callback(location);
      } catch (error) {
        console.error('Location callback error:', error);
      }
    });

    // Check geofences
    this.checkGeofences(location);
  }

  private async storeLocationOffline(location: Location): Promise<void> {
    try {
      const locationHistory = await this.getLocationHistory();
      locationHistory.push(location);
      
      // Keep only last 100 locations
      if (locationHistory.length > 100) {
        locationHistory.splice(0, locationHistory.length - 100);
      }
      
      await AsyncStorage.setItem('locationHistory', JSON.stringify(locationHistory));
    } catch (error) {
      console.error('Store location offline error:', error);
    }
  }

  async getLocationHistory(): Promise<Location[]> {
    try {
      const history = await AsyncStorage.getItem('locationHistory');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Get location history error:', error);
      return [];
    }
  }

  private checkGeofences(location: Location): void {
    this.geofences.forEach(geofence => {
      if (!geofence.isActive) return;

      const distance = this.calculateDistance(
        location.latitude,
        location.longitude,
        geofence.latitude,
        geofence.longitude
      );

      const isInside = distance <= geofence.radius;
      const wasInside = this.wasInsideGeofence(geofence.id);

      if (isInside && !wasInside) {
        // Entering geofence
        this.setGeofenceState(geofence.id, true);
        this.notifyGeofenceCallbacks(geofence, true);
      } else if (!isInside && wasInside) {
        // Exiting geofence
        this.setGeofenceState(geofence.id, false);
        this.notifyGeofenceCallbacks(geofence, false);
      }
    });
  }

  private wasInsideGeofence(geofenceId: string): boolean {
    // This would typically be stored in AsyncStorage or a local database
    // For now, we'll use a simple in-memory approach
    return false; // Simplified implementation
  }

  private setGeofenceState(geofenceId: string, isInside: boolean): void {
    // Store geofence state for tracking enter/exit events
    AsyncStorage.setItem(`geofence_${geofenceId}`, JSON.stringify(isInside));
  }

  private notifyGeofenceCallbacks(geofence: Geofence, isEntering: boolean): void {
    this.geofenceCallbacks.forEach(callback => {
      try {
        callback(geofence, isEntering);
      } catch (error) {
        console.error('Geofence callback error:', error);
      }
    });
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  async isInsideGeofence(latitude: number, longitude: number): Promise<boolean> {
    const activeGeofences = this.geofences.filter(g => g.isActive);
    
    for (const geofence of activeGeofences) {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        geofence.latitude,
        geofence.longitude
      );
      
      if (distance <= geofence.radius) {
        return true;
      }
    }
    
    return false;
  }

  async getNearestGeofence(latitude: number, longitude: number): Promise<Geofence | null> {
    let nearestGeofence: Geofence | null = null;
    let minDistance = Infinity;

    this.geofences.forEach(geofence => {
      if (!geofence.isActive) return;

      const distance = this.calculateDistance(
        latitude,
        longitude,
        geofence.latitude,
        geofence.longitude
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestGeofence = geofence;
      }
    });

    return nearestGeofence;
  }

  private async loadGeofences(): Promise<void> {
    try {
      // In a real app, this would load from the API
      // For now, we'll use stored geofences
      const stored = await AsyncStorage.getItem('geofences');
      if (stored) {
        this.geofences = JSON.parse(stored);
      } else {
        // Default geofences for demo
        this.geofences = [
          {
            id: 'office-main',
            name: 'Main Office',
            latitude: 25.2048, // Dubai coordinates
            longitude: 55.2708,
            radius: 100, // 100 meters
            isActive: true,
          },
          {
            id: 'office-branch',
            name: 'Branch Office',
            latitude: 25.2760,
            longitude: 55.2962,
            radius: 50,
            isActive: true,
          },
        ];
        await this.saveGeofences();
      }
    } catch (error) {
      console.error('Load geofences error:', error);
      this.geofences = [];
    }
  }

  async saveGeofences(): Promise<void> {
    try {
      await AsyncStorage.setItem('geofences', JSON.stringify(this.geofences));
    } catch (error) {
      console.error('Save geofences error:', error);
    }
  }

  async addGeofence(geofence: Omit<Geofence, 'id'>): Promise<string> {
    const id = `geofence_${Date.now()}`;
    const newGeofence: Geofence = { ...geofence, id };
    
    this.geofences.push(newGeofence);
    await this.saveGeofences();
    
    return id;
  }

  async removeGeofence(id: string): Promise<void> {
    this.geofences = this.geofences.filter(g => g.id !== id);
    await this.saveGeofences();
  }

  async updateGeofence(id: string, updates: Partial<Geofence>): Promise<void> {
    const index = this.geofences.findIndex(g => g.id === id);
    if (index !== -1) {
      this.geofences[index] = { ...this.geofences[index], ...updates };
      await this.saveGeofences();
    }
  }

  getGeofences(): Geofence[] {
    return [...this.geofences];
  }

  getCurrentLocation(): Location | null {
    return this.currentLocation;
  }

  onLocationUpdate(callback: (location: Location) => void): () => void {
    this.locationUpdateCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.locationUpdateCallbacks.indexOf(callback);
      if (index !== -1) {
        this.locationUpdateCallbacks.splice(index, 1);
      }
    };
  }

  onGeofenceEvent(callback: (geofence: Geofence, isEntering: boolean) => void): () => void {
    this.geofenceCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.geofenceCallbacks.indexOf(callback);
      if (index !== -1) {
        this.geofenceCallbacks.splice(index, 1);
      }
    };
  }

  async getLocationAccuracy(): Promise<number> {
    try {
      const location = await this.getCurrentPosition();
      return location.accuracy;
    } catch (error) {
      console.error('Get location accuracy error:', error);
      return 0;
    }
  }

  async isLocationServicesEnabled(): Promise<boolean> {
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        () => resolve(true),
        () => resolve(false),
        { timeout: 5000 }
      );
    });
  }

  cleanup(): void {
    this.stopLocationUpdates();
    this.stopBackgroundTracking();
    this.locationUpdateCallbacks = [];
    this.geofenceCallbacks = [];
  }
}

export const LocationService = new LocationServiceClass();

