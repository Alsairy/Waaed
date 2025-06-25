import Beacons from '@hkpuits/react-native-beacons-manager';
import { Platform, PermissionsAndroid, DeviceEventEmitter } from 'react-native';

export interface BeaconRegion {
  identifier: string;
  uuid: string;
  major?: number;
  minor?: number;
}

export interface Beacon {
  uuid: string;
  major: number;
  minor: number;
  rssi: number;
  distance: number;
  proximity: 'immediate' | 'near' | 'far' | 'unknown';
}

export class BeaconService {
  private static isInitialized = false;
  private static monitoredRegions: BeaconRegion[] = [];

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.requestPermissions();

      if (Platform.OS === 'ios') {
        await Beacons.requestWhenInUseAuthorization();
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Beacon service initialization failed:', error);
      throw error;
    }
  }

  private static async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);

        return Object.values(granted).every(
          permission => permission === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (error) {
        console.error('Permission request failed:', error);
        return false;
      }
    }
    return true;
  }

  static async startMonitoring(region: BeaconRegion): Promise<void> {
    try {
      await this.initialize();
      
      await Beacons.startMonitoringForRegion(region);
      this.monitoredRegions.push(region);
      
      console.log(`Started monitoring region: ${region.identifier}`);
    } catch (error) {
      console.error(`Failed to start monitoring region ${region.identifier}:`, error);
      throw error;
    }
  }

  static async stopMonitoring(region: BeaconRegion): Promise<void> {
    try {
      await Beacons.stopMonitoringForRegion(region);
      this.monitoredRegions = this.monitoredRegions.filter(
        r => r.identifier !== region.identifier
      );
      
      console.log(`Stopped monitoring region: ${region.identifier}`);
    } catch (error) {
      console.error(`Failed to stop monitoring region ${region.identifier}:`, error);
      throw error;
    }
  }

  static async startRanging(region: BeaconRegion): Promise<void> {
    try {
      await this.initialize();
      
      await Beacons.startRangingBeaconsInRegion(region);
      console.log(`Started ranging beacons in region: ${region.identifier}`);
    } catch (error) {
      console.error(`Failed to start ranging in region ${region.identifier}:`, error);
      throw error;
    }
  }

  static async stopRanging(region: BeaconRegion): Promise<void> {
    try {
      await Beacons.stopRangingBeaconsInRegion(region);
      console.log(`Stopped ranging beacons in region: ${region.identifier}`);
    } catch (error) {
      console.error(`Failed to stop ranging in region ${region.identifier}:`, error);
      throw error;
    }
  }

  static onRegionEnter(callback: (region: BeaconRegion) => void): void {
    DeviceEventEmitter.addListener('regionDidEnter', callback);
  }

  static onRegionLeave(callback: (region: BeaconRegion) => void): void {
    DeviceEventEmitter.addListener('regionDidExit', callback);
  }

  static onBeaconsDetected(callback: (beacons: Beacon[]) => void): void {
    DeviceEventEmitter.addListener('beaconsDidRange', (data: any) => {
      if (data.beacons && data.beacons.length > 0) {
        callback(data.beacons);
      }
    });
  }

  static async getMonitoredRegions(): Promise<BeaconRegion[]> {
    return [...this.monitoredRegions];
  }

  static async isBluetoothEnabled(): Promise<boolean> {
    try {
      return true;
    } catch (error) {
      console.error('Failed to check Bluetooth state:', error);
      return false;
    }
  }

  static async getAuthorizationStatus(): Promise<string> {
    try {
      if (Platform.OS === 'ios') {
        return 'authorizedWhenInUse'; // Simplified for now
      } else {
        const hasPermissions = await this.requestPermissions();
        return hasPermissions ? 'authorizedWhenInUse' : 'denied';
      }
    } catch (error) {
      console.error('Failed to get authorization status:', error);
      return 'denied';
    }
  }

  static removeAllListeners(): void {
    DeviceEventEmitter.removeAllListeners('regionDidEnter');
    DeviceEventEmitter.removeAllListeners('regionDidExit');
    DeviceEventEmitter.removeAllListeners('beaconsDidRange');
  }

  static async stopAllMonitoring(): Promise<void> {
    try {
      for (const region of this.monitoredRegions) {
        await this.stopMonitoring(region);
      }
      this.monitoredRegions = [];
    } catch (error) {
      console.error('Failed to stop all monitoring:', error);
    }
  }

  static async stopAllRanging(): Promise<void> {
    try {
      for (const region of this.monitoredRegions) {
        await this.stopRanging(region);
      }
    } catch (error) {
      console.error('Failed to stop all ranging:', error);
    }
  }
}
