import { db } from './firebaseConfig';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

// Function to add a new device
export const addDevice = async (userId, deviceName, deviceType, energyUsage, location, isOn = false) => {
  try {
    console.log(`Adding device: ${deviceName} for user: ${userId} with energy usage: ${energyUsage}`);
    
    // Set default settings based on device type
    let defaultSettings = {};
    switch (deviceType) {
      case "Smart Light":
        defaultSettings = { brightness: 75 };
        break;
      case "Thermostat":
        defaultSettings = { temperature: 23 };
        break;
      case "TV":
        defaultSettings = { volume: 10 };
        break;
      case "Roomba":
        defaultSettings = { speed: "Medium" };
        break;
      case "Washing Machine":
        defaultSettings = { timeLeft: 1200 };
        break;
      // Add more device types as needed
    }
    
    const docRef = await addDoc(collection(db, "devices"), {
      userId,
      deviceName,
      deviceType,
      energyUsage,
      location,
      isOn: isOn,
      settings: defaultSettings, // Add initial settings
      totalEnergy: 0,
      totalUsageTime: 0, // Total time device has been on (in seconds)
      lastTurnedOnTime: null, // Timestamp when device was last turned on
      createdAt: new Date(),
      lastUpdated: new Date(),
    });
    
    console.log(`Device added with ID: ${docRef.id}`);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding device:", error);
    return { success: false, error: error.message };
  }
};


export const deleteDevice = async (deviceId) => {
  try {
    await deleteDoc(doc(db, "devices", deviceId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};


// Function to get devices for a user
export const getUserDevices = async (userId) => {
  const devicesRef = collection(db, "devices");
  const q = query(devicesRef, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  const devices = [];
  querySnapshot.forEach((doc) => {
    devices.push({ id: doc.id, ...doc.data() });
  });
  return devices;
};

// Function to update energy usage
export const updateDeviceEnergy = async (deviceId, energyUsage) => {
  const deviceRef = doc(db, "devices", deviceId);
  try {
    await updateDoc(deviceRef, {
      energyUsage,
      totalEnergy: energyUsage // Update total energy as needed
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Function to update device toggle state
export const updateDeviceState = async (deviceId, isOn) => {
  try {
    const deviceRef = doc(db, "devices", deviceId);
    const deviceSnap = await getDoc(deviceRef);
    
    if (!deviceSnap.exists()) {
      return { success: false, error: "Device not found" };
    }
    
    const deviceData = deviceSnap.data();
    const now = new Date();
    let updateData = { isOn: isOn, lastUpdated: now };
    
    // If turning ON, store the current time
    if (isOn) {
      updateData.lastTurnedOnTime = now;
    } 
    // If turning OFF, calculate how long it was on and update total time
    else if (deviceData.lastTurnedOnTime) {
      const lastOnTime = deviceData.lastTurnedOnTime.toDate();
      const usageTimeSeconds = Math.floor((now - lastOnTime) / 1000);
      const totalUsageTime = (deviceData.totalUsageTime || 0) + usageTimeSeconds;
      
      updateData.totalUsageTime = totalUsageTime;
      
      // Calculate and update energy usage if needed
      const energyUsagePerHour = deviceData.energyUsage || 0;
      const hoursUsed = usageTimeSeconds / 3600;
      const energyConsumed = energyUsagePerHour * hoursUsed;
      
      updateData.totalEnergy = (deviceData.totalEnergy || 0) + energyConsumed;
    }
    
    await updateDoc(deviceRef, updateData);
    return { success: true };
  } catch (error) {
    console.error("Error updating device state:", error);
    return { success: false, error: error.message };
  }
};

// Function to get all device states for a user
export const getUserDeviceStates = async (userId) => {
  try {
    const devicesRef = collection(db, "devices");
    const q = query(devicesRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const deviceStates = {};
    querySnapshot.forEach((doc) => {
      const device = doc.data();
      // Use the isOn field from Firestore, defaulting to false if it doesn't exist
      deviceStates[doc.id] = device.isOn === true;
    });
    
    return { success: true, deviceStates };
  } catch (error) {
    console.error("Error getting device states:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Updates device-specific settings in Firestore
 * @param {string} deviceId - The ID of the device to update
 * @param {object} settings - Object containing the settings to update (e.g., brightness, temperature)
 * @returns {Promise<object>} - Response indicating success or failure
 */
export const updateDeviceSettings = async (deviceId, settings) => {
  try {
    const deviceRef = doc(db, "devices", deviceId);
    
    // Update the device with the new settings
    await updateDoc(deviceRef, {
      settings: settings,
      lastUpdated: new Date()
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating device settings:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Gets device settings for a specific device
 * @param {string} deviceId - The ID of the device
 * @returns {Promise<object>} - Response containing the device settings
 */
export const getDeviceSettings = async (deviceId) => {
  try {
    const deviceRef = doc(db, "devices", deviceId);
    const docSnap = await getDoc(deviceRef);
    
    if (docSnap.exists()) {
      const deviceData = docSnap.data();
      return { 
        success: true, 
        settings: deviceData.settings || {} // Return settings or empty object if no settings
      };
    } else {
      return { success: false, error: "Device not found" };
    }
  } catch (error) {
    console.error("Error getting device settings:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Gets energy usage statistics for a device
 * @param {string} deviceId - The ID of the device
 * @returns {Promise<object>} - Response containing energy usage data
 */
export const getDeviceEnergyStats = async (deviceId) => {
  try {
    const deviceRef = doc(db, "devices", deviceId);
    const docSnap = await getDoc(deviceRef);
    
    if (docSnap.exists()) {
      const deviceData = docSnap.data();
      let currentSessionTime = 0;
      
      // If device is currently on, calculate current session time
      if (deviceData.isOn && deviceData.lastTurnedOnTime) {
        const lastOnTime = deviceData.lastTurnedOnTime.toDate();
        const now = new Date();
        currentSessionTime = Math.floor((now - lastOnTime) / 1000);
      }
      
      return { 
        success: true,
        stats: {
          totalUsageTime: deviceData.totalUsageTime || 0, // in seconds
          currentSessionTime, // in seconds
          totalEnergy: deviceData.totalEnergy || 0, // in kWh or whatever unit you're using
          isCurrentlyOn: deviceData.isOn || false,
          energyUsageRate: deviceData.energyUsage || 0 // hourly rate
        }
      };
    } else {
      return { success: false, error: "Device not found" };
    }
  } catch (error) {
    console.error("Error getting device energy stats:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Gets total energy usage across all devices for a user
 * @param {string} userId - The user ID
 * @returns {Promise<object>} - Response containing total energy usage data
 */
export const getUserTotalEnergyUsage = async (userId) => {
  try {
    const devicesRef = collection(db, "devices");
    const q = query(devicesRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    let totalEnergy = 0;
    let totalUsageTime = 0;
    let currentlyActiveDevices = 0;
    
    const now = new Date();
    
    querySnapshot.forEach((doc) => {
      const device = doc.data();
      totalEnergy += device.totalEnergy || 0;
      totalUsageTime += device.totalUsageTime || 0;
      
      // Count and update currently active devices
      if (device.isOn) {
        currentlyActiveDevices++;
        
        // Add energy used in current session (not yet stored in totalEnergy)
        if (device.lastTurnedOnTime) {
          const lastOnTime = device.lastTurnedOnTime.toDate();
          const sessionHours = (now - lastOnTime) / (1000 * 3600);
          totalEnergy += (device.energyUsage || 0) * sessionHours;
        }
      }
    });
    
    return { 
      success: true, 
      usage: {
        totalEnergy,
        totalUsageTimeSeconds: totalUsageTime,
        currentlyActiveDevices
      }
    };
  } catch (error) {
    console.error("Error getting user's energy usage:", error);
    return { success: false, error: error.message };
  }
}; 