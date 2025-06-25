import ReactNativeBiometrics from 'react-native-biometrics';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BiometricResult {
  success: boolean;
  error?: string;
  signature?: string;
  publicKey?: string;
}

export interface BiometricCapabilities {
  isAvailable: boolean;
  biometryType: 'TouchID' | 'FaceID' | 'Biometrics' | null;
  hasEnrolledFingerprints: boolean;
  hasEnrolledFace: boolean;
}

class BiometricServiceClass {
  private rnBiometrics: ReactNativeBiometrics;
  private isInitialized = false;

  constructor() {
    this.rnBiometrics = new ReactNativeBiometrics({
      allowDeviceCredentials: true,
    });
  }

  async initialize(): Promise<void> {
    try {
      const capabilities = await this.getCapabilities();
      if (!capabilities.isAvailable) {
        throw new Error('Biometric authentication not available on this device');
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('BiometricService initialization error:', error);
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const { available } = await this.rnBiometrics.isSensorAvailable();
      return available;
    } catch (error) {
      console.error('Biometric availability check error:', error);
      return false;
    }
  }

  async getCapabilities(): Promise<BiometricCapabilities> {
    try {
      const { available, biometryType } = await this.rnBiometrics.isSensorAvailable();
      
      return {
        isAvailable: available,
        biometryType: biometryType as any,
        hasEnrolledFingerprints: available && (biometryType === 'TouchID' || biometryType === 'Biometrics'),
        hasEnrolledFace: available && biometryType === 'FaceID',
      };
    } catch (error) {
      console.error('Get biometric capabilities error:', error);
      return {
        isAvailable: false,
        biometryType: null,
        hasEnrolledFingerprints: false,
        hasEnrolledFace: false,
      };
    }
  }

  async authenticate(reason?: string): Promise<BiometricResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const capabilities = await this.getCapabilities();
      if (!capabilities.isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication not available',
        };
      }

      const promptMessage = reason || this.getDefaultPromptMessage(capabilities.biometryType);

      const { success, error } = await this.rnBiometrics.simplePrompt({
        promptMessage,
        cancelButtonText: 'Cancel',
      });

      if (success) {
        // Log successful authentication
        await this.logAuthenticationEvent('success');
        
        return {
          success: true,
        };
      } else {
        // Log failed authentication
        await this.logAuthenticationEvent('failed', error);
        
        return {
          success: false,
          error: error || 'Authentication failed',
        };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      await this.logAuthenticationEvent('error', error instanceof Error ? error.message : 'Unknown error');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication error',
      };
    }
  }

  async authenticateWithSignature(payload: string, reason?: string): Promise<BiometricResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const capabilities = await this.getCapabilities();
      if (!capabilities.isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication not available',
        };
      }

      // Check if keys exist, create if not
      const { keysExist } = await this.rnBiometrics.biometricKeysExist();
      if (!keysExist) {
        const keyResult = await this.createBiometricKeys();
        if (!keyResult.success) {
          return keyResult;
        }
      }

      const promptMessage = reason || this.getDefaultPromptMessage(capabilities.biometryType);

      const { success, signature, error } = await this.rnBiometrics.createSignature({
        promptMessage,
        payload,
        cancelButtonText: 'Cancel',
      });

      if (success && signature) {
        await this.logAuthenticationEvent('success_signature');
        
        return {
          success: true,
          signature,
        };
      } else {
        await this.logAuthenticationEvent('failed_signature', error);
        
        return {
          success: false,
          error: error || 'Signature authentication failed',
        };
      }
    } catch (error) {
      console.error('Biometric signature authentication error:', error);
      await this.logAuthenticationEvent('error_signature', error instanceof Error ? error.message : 'Unknown error');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Signature authentication error',
      };
    }
  }

  async createBiometricKeys(): Promise<BiometricResult> {
    try {
      const { publicKey } = await this.rnBiometrics.createKeys();
      
      if (publicKey) {
        // Store public key for server verification
        await AsyncStorage.setItem('biometric_public_key', publicKey);
        
        return {
          success: true,
          publicKey,
        };
      } else {
        return {
          success: false,
          error: 'Failed to create biometric keys',
        };
      }
    } catch (error) {
      console.error('Create biometric keys error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Key creation error',
      };
    }
  }

  async deleteBiometricKeys(): Promise<BiometricResult> {
    try {
      const { keysDeleted } = await this.rnBiometrics.deleteKeys();
      
      if (keysDeleted) {
        // Remove stored public key
        await AsyncStorage.removeItem('biometric_public_key');
        
        return {
          success: true,
        };
      } else {
        return {
          success: false,
          error: 'Failed to delete biometric keys',
        };
      }
    } catch (error) {
      console.error('Delete biometric keys error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Key deletion error',
      };
    }
  }

  async getBiometricPublicKey(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('biometric_public_key');
    } catch (error) {
      console.error('Get biometric public key error:', error);
      return null;
    }
  }

  async checkBiometricKeysExist(): Promise<boolean> {
    try {
      const { keysExist } = await this.rnBiometrics.biometricKeysExist();
      return keysExist;
    } catch (error) {
      console.error('Check biometric keys exist error:', error);
      return false;
    }
  }

  private getDefaultPromptMessage(biometryType: string | null): string {
    switch (biometryType) {
      case 'FaceID':
        return 'Use Face ID to authenticate for attendance';
      case 'TouchID':
        return 'Use Touch ID to authenticate for attendance';
      case 'Biometrics':
        return 'Use biometric authentication for attendance';
      default:
        return 'Authenticate to record attendance';
    }
  }

  private async logAuthenticationEvent(type: string, error?: string): Promise<void> {
    try {
      const event = {
        type,
        timestamp: new Date().toISOString(),
        error,
        platform: Platform.OS,
      };

      // Store authentication events for audit
      const events = await this.getAuthenticationEvents();
      events.push(event);
      
      // Keep only last 50 events
      if (events.length > 50) {
        events.splice(0, events.length - 50);
      }
      
      await AsyncStorage.setItem('biometric_auth_events', JSON.stringify(events));
    } catch (error) {
      console.error('Log authentication event error:', error);
    }
  }

  async getAuthenticationEvents(): Promise<any[]> {
    try {
      const events = await AsyncStorage.getItem('biometric_auth_events');
      return events ? JSON.parse(events) : [];
    } catch (error) {
      console.error('Get authentication events error:', error);
      return [];
    }
  }

  async clearAuthenticationEvents(): Promise<void> {
    try {
      await AsyncStorage.removeItem('biometric_auth_events');
    } catch (error) {
      console.error('Clear authentication events error:', error);
    }
  }

  async enrollBiometric(): Promise<BiometricResult> {
    try {
      const capabilities = await this.getCapabilities();
      
      if (!capabilities.isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication not available on this device',
        };
      }

      // Check if already enrolled
      const keysExist = await this.checkBiometricKeysExist();
      if (keysExist) {
        return {
          success: false,
          error: 'Biometric authentication already enrolled',
        };
      }

      // Create new biometric keys
      const keyResult = await this.createBiometricKeys();
      if (!keyResult.success) {
        return keyResult;
      }

      // Test authentication to ensure it works
      const testResult = await this.authenticate('Verify your biometric enrollment');
      if (!testResult.success) {
        // Clean up keys if test fails
        await this.deleteBiometricKeys();
        return {
          success: false,
          error: 'Biometric enrollment verification failed',
        };
      }

      await this.logAuthenticationEvent('enrollment_success');
      
      return {
        success: true,
        publicKey: keyResult.publicKey,
      };
    } catch (error) {
      console.error('Biometric enrollment error:', error);
      await this.logAuthenticationEvent('enrollment_error', error instanceof Error ? error.message : 'Unknown error');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Enrollment error',
      };
    }
  }

  async unenrollBiometric(): Promise<BiometricResult> {
    try {
      const result = await this.deleteBiometricKeys();
      
      if (result.success) {
        await this.logAuthenticationEvent('unenrollment_success');
      } else {
        await this.logAuthenticationEvent('unenrollment_error', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Biometric unenrollment error:', error);
      await this.logAuthenticationEvent('unenrollment_error', error instanceof Error ? error.message : 'Unknown error');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unenrollment error',
      };
    }
  }

  async isBiometricEnrolled(): Promise<boolean> {
    try {
      const capabilities = await this.getCapabilities();
      if (!capabilities.isAvailable) {
        return false;
      }

      const keysExist = await this.checkBiometricKeysExist();
      return keysExist;
    } catch (error) {
      console.error('Check biometric enrollment error:', error);
      return false;
    }
  }

  async showBiometricSettings(): Promise<void> {
    try {
      const capabilities = await this.getCapabilities();
      
      let message = 'Biometric authentication is not available on this device.';
      
      if (capabilities.isAvailable) {
        switch (capabilities.biometryType) {
          case 'FaceID':
            message = 'To use Face ID, please set it up in Settings > Face ID & Passcode.';
            break;
          case 'TouchID':
            message = 'To use Touch ID, please set it up in Settings > Touch ID & Passcode.';
            break;
          case 'Biometrics':
            message = 'To use biometric authentication, please set it up in your device settings.';
            break;
          default:
            message = 'Please set up biometric authentication in your device settings.';
        }
      }

      Alert.alert(
        'Biometric Setup',
        message,
        [
          { text: 'OK', style: 'default' },
        ]
      );
    } catch (error) {
      console.error('Show biometric settings error:', error);
    }
  }

  async validateBiometricIntegrity(): Promise<boolean> {
    try {
      const capabilities = await this.getCapabilities();
      if (!capabilities.isAvailable) {
        return false;
      }

      const keysExist = await this.checkBiometricKeysExist();
      if (!keysExist) {
        return false;
      }

      // Test signature creation to validate integrity
      const testPayload = `integrity_test_${Date.now()}`;
      const result = await this.authenticateWithSignature(testPayload, 'Validating biometric setup');
      
      return result.success;
    } catch (error) {
      console.error('Validate biometric integrity error:', error);
      return false;
    }
  }

  cleanup(): void {
    this.isInitialized = false;
  }
}

export const BiometricService = new BiometricServiceClass();

