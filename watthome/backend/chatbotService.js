import { db } from './firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc, limit, orderBy } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

/**
 * Fetch user's device information for the chatbot
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<object>} - Response with device data
 */
export const getChatbotDeviceData = async (userId) => {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" };
    }

    // Query devices for this user
    const devicesRef = collection(db, "devices");
    const q = query(devicesRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { 
        success: true, 
        devices: [],
        message: "No devices found for this user"
      };
    }

    // Process device data
    const devices = [];
    querySnapshot.forEach((doc) => {
      const deviceData = doc.data();
      // Add only essential data needed for the chatbot
      devices.push({
        id: doc.id,
        name: deviceData.deviceName || "Unnamed Device",
        type: deviceData.deviceType || "Unknown Type",
        location: deviceData.location || "Unspecified Location",
        isOn: deviceData.isOn || false,
        totalEnergy: deviceData.totalEnergy || 0,
        energyUsageRate: deviceData.energyUsage || 0,
        settings: deviceData.settings || {}
      });
    });

    return { 
      success: true, 
      devices,
      count: devices.length
    };
  } catch (error) {
    console.error("Error fetching device data for chatbot:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch user's energy consumption data for the chatbot
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<object>} - Response with energy data
 */
export const getChatbotEnergyData = async (userId) => {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" };
    }

    // Query devices to calculate total energy
    const devicesRef = collection(db, "devices");
    const q = query(devicesRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { 
        success: true, 
        totalEnergy: 0,
        deviceEnergies: [],
        message: "No energy data found"
      };
    }

    // Calculate total energy and gather device-specific data
    let totalEnergy = 0;
    const deviceEnergies = [];
    const deviceTypes = {};

    querySnapshot.forEach((doc) => {
      const deviceData = doc.data();
      const energy = deviceData.totalEnergy || 0;
      totalEnergy += energy;
      
      const deviceType = deviceData.deviceType || "Unknown Type";
      
      // Track energy by device type
      if (!deviceTypes[deviceType]) {
        deviceTypes[deviceType] = 0;
      }
      deviceTypes[deviceType] += energy;
      
      deviceEnergies.push({
        id: doc.id,
        name: deviceData.deviceName || "Unnamed Device",
        type: deviceType,
        energy: energy,
        location: deviceData.location || "Unspecified Location"
      });
    });

    // Prepare energy by device type for reporting
    const energyByType = Object.entries(deviceTypes).map(([type, energy]) => ({
      type,
      energy
    })).sort((a, b) => b.energy - a.energy); // Sort by highest energy first

    return { 
      success: true, 
      totalEnergy,
      deviceEnergies,
      energyByType,
      count: deviceEnergies.length
    };
  } catch (error) {
    console.error("Error fetching energy data for chatbot:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch user's automation data for the chatbot
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<object>} - Response with automation data
 */
export const getChatbotAutomationData = async (userId) => {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" };
    }

    // Query automations for this user
    const automationsRef = collection(db, "automations");
    const q = query(automationsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { 
        success: true, 
        automations: [],
        message: "No automations found for this user"
      };
    }

    // Process automation data
    const automations = [];
    querySnapshot.forEach((doc) => {
      const automationData = doc.data();
      automations.push({
        id: doc.id,
        name: automationData.name || "Unnamed Automation",
        trigger: automationData.trigger || "Unknown Trigger",
        actions: automationData.actions || "Unknown Action",
        isActive: automationData.isActive || false,
        devices: (automationData.devices || []).map(device => ({
          id: device.id,
          name: device.name || "Unnamed Device"
        }))
      });
    });

    return { 
      success: true, 
      automations,
      count: automations.length
    };
  } catch (error) {
    console.error("Error fetching automation data for chatbot:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get the most recently used devices
 * @param {string} userId - The authenticated user's ID
 * @param {number} limit - Maximum number of devices to return
 * @returns {Promise<object>} - Response with recent devices
 */
export const getRecentDevices = async (userId, limit = 5) => {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" };
    }

    // Query devices ordered by lastUpdated timestamp
    const devicesRef = collection(db, "devices");
    const q = query(
      devicesRef, 
      where("userId", "==", userId),
      orderBy("lastUpdated", "desc"),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { 
        success: true, 
        devices: [],
        message: "No recent devices found"
      };
    }

    // Process device data
    const devices = [];
    querySnapshot.forEach((doc) => {
      const deviceData = doc.data();
      devices.push({
        id: doc.id,
        name: deviceData.deviceName || "Unnamed Device",
        type: deviceData.deviceType || "Unknown Type",
        isOn: deviceData.isOn || false,
        lastUpdated: deviceData.lastUpdated ? deviceData.lastUpdated.toDate() : null
      });
    });

    return { 
      success: true, 
      devices
    };
  } catch (error) {
    console.error("Error fetching recent devices for chatbot:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get high energy usage devices for energy saving recommendations
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<object>} - Response with high energy devices
 */
export const getHighEnergyDevices = async (userId) => {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" };
    }

    // Get all user devices
    const devicesRef = collection(db, "devices");
    const q = query(devicesRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { 
        success: true, 
        devices: [],
        message: "No devices found for energy analysis"
      };
    }

    // Process and sort by energy consumption
    const devices = [];
    querySnapshot.forEach((doc) => {
      const deviceData = doc.data();
      const energy = deviceData.totalEnergy || 0;
      
      devices.push({
        id: doc.id,
        name: deviceData.deviceName || "Unnamed Device",
        type: deviceData.deviceType || "Unknown Type",
        energy: energy,
        usageRate: deviceData.energyUsage || 0,
        isOn: deviceData.isOn || false
      });
    });
    
    // Sort by highest energy consumption
    const sortedDevices = devices.sort((a, b) => b.energy - a.energy);
    
    // Take top devices or devices consuming more than average
    const averageEnergy = devices.reduce((sum, device) => sum + device.energy, 0) / devices.length;
    const highEnergyDevices = sortedDevices.filter(device => 
      device.energy > averageEnergy || sortedDevices.indexOf(device) < 3
    );

    return { 
      success: true, 
      devices: highEnergyDevices,
      averageEnergy
    };
  } catch (error) {
    console.error("Error analyzing energy usage for chatbot:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate energy savings recommendations based on device usage patterns
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<object>} - Response with recommendations
 */
export const getEnergySavingRecommendations = async (userId) => {
  try {
    // Get high energy devices first
    const highEnergyResult = await getHighEnergyDevices(userId);
    
    if (!highEnergyResult.success) {
      return highEnergyResult;
    }
    
    const recommendations = [];
    
    // Generate device-specific recommendations
    for (const device of highEnergyResult.devices) {
      switch (device.type) {
        case 'Smart Light':
          if (device.isOn) {
            recommendations.push(`Consider turning off the ${device.name} when not in use to save energy.`);
          }
          // Check brightness settings if available
          if (device.settings && device.settings.brightness > 75) {
            recommendations.push(`Reduce brightness of ${device.name} to 75% or lower to save energy.`);
          }
          break;
          
        case 'Thermostat':
          if (device.settings && device.settings.temperature) {
            const temp = device.settings.temperature;
            // Recommend energy-efficient temperature settings
            if (temp < 22) {
              recommendations.push(`Increase ${device.name} temperature to 22°C or higher to reduce energy consumption.`);
            } else if (temp > 26) {
              recommendations.push(`Decrease ${device.name} temperature to 26°C or lower for optimal efficiency.`);
            }
          }
          break;
          
        case 'TV':
          if (device.isOn) {
            recommendations.push(`Remember to turn off ${device.name} when not watching to save energy.`);
          }
          break;
          
        case 'Washing Machine':
          recommendations.push(`For ${device.name}, consider using cold water wash cycles to reduce energy usage.`);
          break;
          
        default:
          if (device.isOn && device.energy > highEnergyResult.averageEnergy * 1.5) {
            recommendations.push(`${device.name} is using more energy than average. Consider checking its settings.`);
          }
      }
    }
    
    // Add general recommendations if we don't have many device-specific ones
    if (recommendations.length < 3) {
      recommendations.push("Consider using smart plugs to monitor and control devices that don't have built-in smart features.");
      recommendations.push("Set up automations to turn off devices during periods of non-use.");
      recommendations.push("Use the Energy dashboard to identify which devices are consuming the most energy.");
    }

    return { 
      success: true, 
      recommendations,
      highEnergyDevices: highEnergyResult.devices
    };
  } catch (error) {
    console.error("Error generating energy recommendations for chatbot:", error);
    return { success: false, error: error.message };
  }
}; 