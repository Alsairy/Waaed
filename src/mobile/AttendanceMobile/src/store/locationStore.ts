import { create } from 'zustand';
import { Location, GeofenceRegion } from '../types/Location';

interface LocationState {
  currentLocation: Location | null;
  geofenceRegions: GeofenceRegion[];
  isLocationEnabled: boolean;
  isTracking: boolean;
  locationHistory: Location[];
  error: string | null;
  
  setCurrentLocation: (location: Location) => void;
  setLocation: (location: Location) => void;
  addGeofenceRegion: (region: GeofenceRegion) => void;
  removeGeofenceRegion: (regionId: string) => void;
  setLocationEnabled: (enabled: boolean) => void;
  setTracking: (tracking: boolean) => void;
  addLocationToHistory: (location: Location) => void;
  clearLocationHistory: () => void;
  setError: (error: string | null) => void;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  currentLocation: null,
  geofenceRegions: [],
  isLocationEnabled: false,
  isTracking: false,
  locationHistory: [],
  error: null,
  
  setCurrentLocation: (location: Location) => {
    set({ currentLocation: location, error: null });
    get().addLocationToHistory(location);
  },
  
  addGeofenceRegion: (region: GeofenceRegion) => {
    set(state => ({
      geofenceRegions: [...state.geofenceRegions, region]
    }));
  },
  
  removeGeofenceRegion: (regionId: string) => {
    set(state => ({
      geofenceRegions: state.geofenceRegions.filter(region => region.id !== regionId)
    }));
  },
  
  setLocationEnabled: (enabled: boolean) => {
    set({ isLocationEnabled: enabled });
  },
  
  setTracking: (tracking: boolean) => {
    set({ isTracking: tracking });
  },
  
  addLocationToHistory: (location: Location) => {
    set(state => ({
      locationHistory: [...state.locationHistory.slice(-99), location] // Keep last 100 locations
    }));
  },
  
  clearLocationHistory: () => {
    set({ locationHistory: [] });
  },
  
  setError: (error: string | null) => {
    set({ error });
  },
  
  setLocation: (location: Location) => {
    set({ currentLocation: location, error: null });
    get().addLocationToHistory(location);
  },
}));
