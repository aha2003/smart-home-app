import { db } from './firebaseConfig';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { updateDeviceState, updateDeviceSettings } from './deviceService';

// Store for automation timers 
let automationTimers = {};

/**
 * Creates a new automation in Firestore
 * @param {string} userId - The user ID
 * @param {string} name - Name of the automation
 * @param {string} trigger - Type of trigger (Time of Day, Temperature Above, Temperature Below)
 * @param {string} [triggerTime] - Time for time-based automations (format: "HH:MM AM/PM")
 * @param {string} [triggerValue] - Value for condition-based triggers
 * @param {Array} devices - Array of device IDs and their details
 * @param {string} [actions] - Type of action (Turn On, Turn Off, Set Temperature, Set Brightness)
 * @param {string} [actionValue] - Value for the action (temperature or brightness level)
 * @param {string} frequency - How often it runs (defaults to 'Daily')
 * @param {boolean} notifyBefore - Whether to notify before execution
 * @param {object} [triggerDevice] - Device used as sensor for temperature-based automations
 * @returns {Promise<object>} - Response with the new automation ID
 */
export const createAutomation = async (
  userId,
  name,
  trigger,
  triggerTime = undefined,
  triggerValue = undefined,
  devices = [],
  actions = undefined,
  actionValue = undefined,
  frequency = 'Daily',
  notifyBefore = false,
  triggerDevice = undefined
) => {
  try {
    console.log(`Creating automation: ${name} for user ${userId}`);
    
    if (!userId) {
      return { success: false, error: "User ID is required" };
    }
    
    // Prepare a clean document by filtering out undefined values
    const automationData = {
      userId,
      name,
      trigger,
      devices,
      isActive: true,
      frequency,
      notifyBefore,
      createdAt: new Date(),
      lastUpdated: new Date(),
      lastTriggered: null
    };
    
    // Only add fields that are not undefined
    if (triggerTime !== undefined) automationData.triggerTime = triggerTime;
    if (triggerValue !== undefined) automationData.triggerValue = triggerValue;
    if (actions !== undefined) automationData.actions = actions;
    if (actionValue !== undefined) automationData.actionValue = actionValue;
    if (triggerDevice !== undefined) automationData.triggerDevice = triggerDevice;
    
    const docRef = await addDoc(collection(db, "automations"), automationData);
    
    console.log(`Automation created with ID: ${docRef.id}`);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating automation:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Gets all automations for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} - List of automations
 */
export const getUserAutomations = async (userId) => {
  try {
    const automationsRef = collection(db, "automations");
    const q = query(automationsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const automations = [];
    querySnapshot.forEach((doc) => {
      automations.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, automations };
  } catch (error) {
    console.error("Error getting automations:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Updates an existing automation
 * @param {string} automationId - The automation ID
 * @param {object} updates - The fields to update
 * @returns {Promise<object>} - Success/failure response
 */
export const updateAutomation = async (automationId, updates) => {
  try {
    const automationRef = doc(db, "automations", automationId);
    
    // Add timestamp for the update
    updates.lastUpdated = new Date();
    
    await updateDoc(automationRef, updates);
    return { success: true };
  } catch (error) {
    console.error("Error updating automation:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Deletes an automation
 * @param {string} automationId - The automation ID
 * @returns {Promise<object>} - Success/failure response
 */
export const deleteAutomation = async (automationId) => {
  try {
    const automationRef = doc(db, "automations", automationId);
    await deleteDoc(automationRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting automation:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Toggles the active state of an automation
 * @param {string} automationId - The automation ID
 * @param {boolean} isActive - The new active state
 * @returns {Promise<object>} - Success/failure response
 */
export const toggleAutomationActive = async (automationId, isActive) => {
  try {
    const automationRef = doc(db, "automations", automationId);
    await updateDoc(automationRef, { 
      isActive: isActive,
      lastUpdated: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error("Error toggling automation:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Executes the action for a specific automation on its devices
 * @param {object} automation - The automation object
 * @returns {Promise<object>} - Success/failure response with results
 */
export const executeAutomation = async (automation) => {
  try {
    if (!automation.isActive) {
      return { success: true, message: "Automation is not active", executed: false };
    }
    
    console.log(`Starting execution of automation: ${automation.id} (${automation.name})`);
    console.log(`Action: ${automation.actions}, Devices: ${automation.devices ? automation.devices.length : 0}`);
    
    const results = [];
    
    // Process each device in the automation
    for (const device of automation.devices) {
      try {
        const deviceId = device.id.toString();
        const deviceName = device.name || device.deviceName || 'unnamed device';
        const deviceType = device.deviceType || 'unknown type';
        
        console.log(`Processing device: ${deviceId} (${deviceName}, ${deviceType})`);
        
        // Determine the action to take based on the automation action type
        switch (automation.actions) {
          case 'Turn On':
            console.log(`Turning ON device: ${deviceId}`);
            await updateDeviceState(deviceId, true);
            results.push({ deviceId, success: true, action: 'Turned On' });
            break;
            
          case 'Turn Off':
            console.log(`Turning OFF device: ${deviceId}`);
            // Get current device state to verify it was actually on before
            const deviceRef = doc(db, "devices", deviceId);
            const deviceSnap = await getDoc(deviceRef);
            if (deviceSnap.exists()) {
              const currentState = deviceSnap.data().isOn;
              console.log(`Current device state before turning off: ${currentState ? 'ON' : 'OFF'}`);
            }
            
            await updateDeviceState(deviceId, false);
            results.push({ deviceId, success: true, action: 'Turned Off' });
            break;
            
          case 'Set Temperature':
            if (device.deviceType === 'Thermostat' && automation.actionValue) {
              const temperature = parseInt(automation.actionValue);
              console.log(`Setting temperature for device ${deviceId} to ${temperature}°C`);
              await updateDeviceSettings(deviceId, { temperature });
              results.push({ deviceId, success: true, action: `Set Temperature to ${temperature}°C` });
            } else {
              console.log(`Cannot set temperature: device is not a thermostat or missing value`);
              results.push({ deviceId, success: false, error: 'Invalid device type or missing value for temperature' });
            }
            break;
            
          case 'Set Brightness':
            if (device.deviceType === 'Smart Light' && automation.actionValue) {
              const brightness = parseInt(automation.actionValue);
              console.log(`Setting brightness for device ${deviceId} to ${brightness}%`);
              await updateDeviceSettings(deviceId, { brightness });
              results.push({ deviceId, success: true, action: `Set Brightness to ${brightness}%` });
            } else {
              console.log(`Cannot set brightness: device is not a smart light or missing value`);
              results.push({ deviceId, success: false, error: 'Invalid device type or missing value for brightness' });
            }
            break;
            
          default:
            console.log(`Unsupported action: ${automation.actions}`);
            results.push({ deviceId, success: false, error: 'Unsupported action' });
        }
      } catch (deviceError) {
        console.error(`Error processing device ${device.id}:`, deviceError);
        results.push({ deviceId: device.id, success: false, error: deviceError.message });
      }
    }
    
    // Update the automation's lastTriggered timestamp
    const automationRef = doc(db, "automations", automation.id);
    await updateDoc(automationRef, { 
      lastTriggered: new Date()
    });
    
    console.log(`Automation execution completed with ${results.length} device actions`);
    
    return { 
      success: true, 
      executed: true,
      results 
    };
  } catch (error) {
    console.error("Error executing automation:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Checks active time-based automations and executes them if the current time matches or has passed
 * @param {string} userId - The user ID
 * @returns {Promise<object>} - Success/failure response
 */
export const checkTimeBasedAutomations = async (userId) => {
  try {
    // Get the current time
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Format the current time as HH:MM AM/PM for comparison
    const isPM = currentHour >= 12;
    const hour12 = currentHour % 12 || 12; // Convert 0 to 12 for 12 AM
    const formattedHour = hour12.toString().padStart(2, '0');
    const formattedMinute = currentMinute.toString().padStart(2, '0');
    const period = isPM ? 'PM' : 'AM';
    
    // Format: "09:30 AM" or "02:45 PM"
    const currentTimeString = `${formattedHour}:${formattedMinute} ${period}`;
    console.log(`Current time for automation check: ${currentTimeString}`);
    
    // Track today's date to check if automation was already triggered today
    const today = new Date().setHours(0, 0, 0, 0);
    
    // Get all active time-based automations for this user
    const automationsRef = collection(db, "automations");
    const q = query(
      automationsRef, 
      where("userId", "==", userId),
      where("isActive", "==", true),
      where("trigger", "==", "Time of Day")
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return { success: true, executed: false, message: "No active time-based automations found" };
    }
    
    console.log(`Found ${snapshot.docs.length} time-based automations to check`);
    const executedAutomations = [];
    
    // Check each automation
    for (const doc of snapshot.docs) {
      const automation = { id: doc.id, ...doc.data() };
      
      // Get the trigger time
      const triggerTime = automation.triggerTime;
      
      // Skip if triggerTime is not valid
      if (!triggerTime || typeof triggerTime !== 'string') {
        console.log(`Skipping automation ${automation.id}: Invalid trigger time format`);
        continue;
      }
      
      console.log(`Checking automation: ${automation.id} (${automation.name}), Trigger time: ${triggerTime}`);
      
      // Check if this automation was already triggered today
      if (automation.lastTriggered) {
        let lastTriggeredDate;
        
        // Handle both Date objects and Firestore Timestamps
        if (automation.lastTriggered instanceof Date) {
          lastTriggeredDate = automation.lastTriggered;
        } else if (automation.lastTriggered.toDate) {
          // Firestore Timestamp object
          lastTriggeredDate = automation.lastTriggered.toDate();
        } else if (automation.lastTriggered.seconds) {
          // Firestore Timestamp-like object
          lastTriggeredDate = new Date(automation.lastTriggered.seconds * 1000);
        } else {
          // Try to convert from string or number
          lastTriggeredDate = new Date(automation.lastTriggered);
        }
        
        // Check if the date is valid
        if (!isNaN(lastTriggeredDate.getTime())) {
          const lastTriggeredDay = new Date(lastTriggeredDate).setHours(0, 0, 0, 0);
          
          if (lastTriggeredDay === today) {
            console.log(`Automation ${automation.id} already triggered today at ${lastTriggeredDate.toLocaleTimeString()}, skipping`);
            continue;
          }
        }
      }
      
      // Parse trigger time and current time
      const triggerParts = triggerTime.match(/(\d+):(\d+)\s+(AM|PM)/i);
      const currentParts = currentTimeString.match(/(\d+):(\d+)\s+(AM|PM)/i);
      
      if (!triggerParts || !currentParts) {
        console.log(`Skipping automation ${automation.id}: Could not parse time format`);
        continue;
      }
      
      const triggerHour = parseInt(triggerParts[1]);
      const triggerMinute = parseInt(triggerParts[2]);
      const triggerPeriod = triggerParts[3].toUpperCase();
      
      const currentHour12 = parseInt(currentParts[1]);
      const currentMinute = parseInt(currentParts[2]);
      const currentPeriod = currentParts[3].toUpperCase();
      
      // Convert times to comparable values (minutes since midnight)
      const triggerTotalMinutes = (triggerPeriod === 'PM' && triggerHour !== 12 ? triggerHour + 12 : (triggerPeriod === 'AM' && triggerHour === 12 ? 0 : triggerHour)) * 60 + triggerMinute;
      const currentTotalMinutes = (currentPeriod === 'PM' && currentHour12 !== 12 ? currentHour12 + 12 : (currentPeriod === 'AM' && currentHour12 === 12 ? 0 : currentHour12)) * 60 + currentMinute;
      
      console.log(`Trigger time: ${triggerTotalMinutes} minutes, Current time: ${currentTotalMinutes} minutes`);
      
      // Execute if current time matches exactly OR if current time has passed the trigger time (within today)
      // But not if more than 3 hours (180 minutes) have passed since the trigger time
      const minutesPassed = currentTotalMinutes - triggerTotalMinutes;
      const maxMinutesLate = 180; // 3 hours maximum delay
      const isTooLate = minutesPassed > maxMinutesLate;

      const shouldExecute = currentTotalMinutes >= triggerTotalMinutes && !isTooLate;
      
      if (shouldExecute) {
        console.log(`Time condition met for automation ${automation.id}: ${triggerTime} (${minutesPassed > 0 ? minutesPassed + ' minutes late' : 'exact time'})`);
        
        // Execute the automation
        const result = await executeAutomation(automation);
        if (result.success && result.executed) {
          executedAutomations.push({ id: automation.id, name: automation.name });
          console.log(`Successfully executed automation: ${automation.name}`);
        } else {
          console.log(`Failed to execute automation: ${result.error || 'unknown error'}`);
        }
      } else if (isTooLate) {
        console.log(`Automation ${automation.id} would trigger, but too much time has passed (${minutesPassed} minutes, max allowed: ${maxMinutesLate})`);
      } else {
        console.log(`Time condition not met for automation ${automation.id}: current time (${currentTimeString}) has not reached trigger time (${triggerTime})`);
      }
    }
    
    if (executedAutomations.length > 0) {
      return { 
        success: true, 
        executed: true, 
        count: executedAutomations.length
      };
    } else {
      return { 
        success: true, 
        executed: false, 
        message: "No automations to execute at this time" 
      };
    }
  } catch (error) {
    console.error('Error checking time-based automations:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Checks temperature-based automations and executes them if conditions are met
 * @param {string} userId - The user ID
 * @returns {Promise<object>} - Success/failure response
 */
export const checkTemperatureBasedAutomations = async (userId) => {
  try {
    console.log(`Starting temperature automation check for user: ${userId}`);
    
    // Get all active temperature-based automations for this user
    const automationsRef = collection(db, "automations");
    const q = query(
      automationsRef, 
      where("userId", "==", userId),
      where("isActive", "==", true),
      where("trigger", "in", ["Temperature Above", "Temperature Below"])
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log("No active temperature-based automations found");
      return { success: true, executed: false, message: "No active temperature-based automations found" };
    }
    
    console.log(`Found ${snapshot.docs.length} temperature-based automations to check`);
    const executedAutomations = [];
    
    // Check each automation
    for (const doc of snapshot.docs) {
      const automation = { id: doc.id, ...doc.data() };
      console.log(`Checking automation: ${automation.id} (${automation.name}), Trigger: ${automation.trigger}, Value: ${automation.triggerValue}`);
      
      // Skip if no devices or no trigger value or no trigger device
      if (!automation.devices || automation.devices.length === 0) {
        console.log(`- Skipping: No devices specified`);
        continue;
      }
      
      if (!automation.triggerValue) {
        console.log(`- Skipping: No trigger value specified`);
        continue;
      }
      
      if (!automation.triggerDevice) {
        console.log(`- Skipping: No trigger device specified`);
        continue;
      }
      
      try {
        // Get the trigger device data (the thermostat acting as the sensor)
        const triggerDeviceId = automation.triggerDevice.id.toString();
        console.log(`- Using trigger device: ${triggerDeviceId} (${automation.triggerDevice.name || automation.triggerDevice.deviceName || 'unnamed'})`);
        
        const deviceRef = doc(db, "devices", triggerDeviceId);
        const deviceDoc = await getDoc(deviceRef);
        
        if (!deviceDoc.exists()) {
          console.log(`- Error: Trigger device ${triggerDeviceId} not found in database`);
          continue;
        }
        
        const deviceData = deviceDoc.data();
        // Log entire device data to debug
        console.log(`- Device data retrieved: ${JSON.stringify(deviceData, null, 2)}`);
        
        // Check if settings exists
        if (!deviceData.settings) {
          console.log(`- Error: Device has no settings field`);
          continue;
        }
        
        const currentTemp = deviceData.settings?.temperature;
        
        // Skip if temperature not set on the trigger device
        if (currentTemp === undefined || currentTemp === null) {
          console.log(`- Error: No temperature reading available for device`);
          continue;
        }
        
        // Convert both to numbers to ensure proper comparison
        const currentTempNum = Number(currentTemp);
        const triggerValueNum = Number(automation.triggerValue);
        
        if (isNaN(currentTempNum)) {
          console.log(`- Error: Current temperature is not a valid number: ${currentTemp}`);
          continue;
        }
        
        if (isNaN(triggerValueNum)) {
          console.log(`- Error: Trigger value is not a valid number: ${automation.triggerValue}`);
          continue;
        }
        
        console.log(`- Comparing: Current temp ${currentTempNum}°C with trigger ${automation.trigger} ${triggerValueNum}°C`);
        
        let shouldTrigger = false;
        
        // Detailed log for debugging comparison
        if (automation.trigger === "Temperature Above") {
          console.log(`- Evaluation: ${currentTempNum} > ${triggerValueNum} = ${currentTempNum > triggerValueNum}`);
          shouldTrigger = currentTempNum > triggerValueNum;
        } else if (automation.trigger === "Temperature Below") {
          console.log(`- Evaluation: ${currentTempNum} < ${triggerValueNum} = ${currentTempNum < triggerValueNum}`);
          shouldTrigger = currentTempNum < triggerValueNum;
        }
        
        if (shouldTrigger) {
          console.log(`- Condition met: Current temp ${currentTempNum}°C is ${automation.trigger === "Temperature Above" ? "greater than" : "less than"} trigger value ${triggerValueNum}°C`);
          
          // Log the devices that will be controlled
          console.log(`- Will control ${automation.devices.length} devices with action: ${automation.actions}`);
          automation.devices.forEach(device => {
            console.log(`  - Device: ${device.id} (${device.name || device.deviceName || 'unnamed'}, type: ${device.deviceType || 'unknown'})`);
          });
          
          // Execute the automation
          console.log(`- Executing automation ${automation.id}`);
          const result = await executeAutomation(automation);
          
          if (result.success && result.executed) {
            executedAutomations.push({ id: automation.id, name: automation.name });
            console.log(`- Success: Executed automation ${automation.id}`);
            console.log(`- Results: ${JSON.stringify(result.results)}`);
          } else {
            console.log(`- Failed to execute automation: ${result.error || result.message || 'Unknown error'}`);
            console.log(`- Result details: ${JSON.stringify(result)}`);
          }
        } else {
          console.log(`- Condition not met: ${currentTempNum}°C is not ${automation.trigger === "Temperature Above" ? "greater than" : "less than"} ${triggerValueNum}°C`);
        }
      } catch (deviceError) {
        console.error(`Error processing trigger device for automation ${automation.id}:`, deviceError);
      }
    }
    
    if (executedAutomations.length > 0) {
      console.log(`Executed ${executedAutomations.length} temperature-based automations`);
      return { 
        success: true, 
        executed: true, 
        count: executedAutomations.length
      };
    } else {
      console.log(`No temperature-based automations needed to be executed at this time`);
      return { 
        success: true, 
        executed: false, 
        message: "No temperature-based automations to execute at this time" 
      };
    }
  } catch (error) {
    console.error('Error checking temperature-based automations:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Starts the automation checking system
 * @param {string} userId - The user ID
 * @returns {object} - Control functions to stop/pause the automation system
 */
export const startAutomationSystem = (userId) => {
  if (!userId) {
    return { success: false, error: 'No user ID provided' };
  }
  
  console.log(`Starting automation system for user: ${userId}`);
  
  // Clear any existing timers
  stopAutomationSystem();
  
  // Set up time-based checking every 30 seconds (more frequent to catch missed triggers)
  automationTimers.timeChecker = setInterval(async () => {
    console.log("Running scheduled time-based automation check...");
    await checkTimeBasedAutomations(userId);
  }, 30 * 1000); // Check every 30 seconds
  
  // Set up temperature-based checking every minute (was 5 minutes)
  automationTimers.temperatureChecker = setInterval(async () => {
    console.log("Running scheduled temperature-based automation check...");
    await checkTemperatureBasedAutomations(userId);
  }, 60 * 1000); // Check every minute now instead of every 5 minutes
  
  // Run checks immediately on startup
  setTimeout(async () => {
    console.log("Running initial automation checks...");
    await checkTimeBasedAutomations(userId);
    await checkTemperatureBasedAutomations(userId);
  }, 5000); // Wait 5 seconds after initialization to run initial checks
  
  return {
    success: true,
    message: 'Automation system started',
    stop: stopAutomationSystem
  };
};

/**
 * Stops the automation checking system
 */
export const stopAutomationSystem = () => {
  // Clear all timers
  if (automationTimers.timeChecker) {
    clearInterval(automationTimers.timeChecker);
  }
  
  if (automationTimers.temperatureChecker) {
    clearInterval(automationTimers.temperatureChecker);
  }
  
  // Reset the timers object
  automationTimers = {};
  
  return {
    success: true,
    message: 'Automation system stopped'
  };
};

/**
 * Immediately checks a specific automation regardless of its trigger type
 * This is useful for debugging or testing
 * @param {string} automationId - The ID of the automation to check
 * @returns {Promise<object>} - Success/failure response with results
 */
export const forceCheckAutomation = async (automationId) => {
  try {
    console.log(`Force checking automation: ${automationId}`);
    
    // Get the automation from Firestore
    const automationRef = doc(db, "automations", automationId);
    const automationSnap = await getDoc(automationRef);
    
    if (!automationSnap.exists()) {
      return { success: false, error: "Automation not found" };
    }
    
    const automation = { id: automationId, ...automationSnap.data() };
    
    // Check if the automation is active
    if (!automation.isActive) {
      return { success: false, error: "Automation is not active" };
    }
    
    console.log(`Automation: ${automation.name}, Trigger: ${automation.trigger}`);
    
    // For time-based automations, just execute
    if (automation.trigger === "Time of Day") {
      console.log(`Executing time-based automation: ${automationId}`);
      return await executeAutomation(automation);
    }
    
    // For temperature-based automations, check condition
    else if (automation.trigger === "Temperature Above" || automation.trigger === "Temperature Below") {
      if (!automation.triggerDevice || !automation.triggerValue) {
        return { success: false, error: "Missing trigger device or trigger value" };
      }
      
      // Get the temperature from the trigger device
      const triggerDeviceId = automation.triggerDevice.id.toString();
      console.log(`Checking temperature from device: ${triggerDeviceId} (${automation.triggerDevice.name || automation.triggerDevice.deviceName || 'unnamed'})`);
      
      const deviceRef = doc(db, "devices", triggerDeviceId);
      const deviceSnap = await getDoc(deviceRef);
      
      if (!deviceSnap.exists()) {
        return { success: false, error: "Trigger device not found" };
      }
      
      const deviceData = deviceSnap.data();
      console.log(`Complete device data: ${JSON.stringify(deviceData, null, 2)}`);
      
      if (!deviceData.settings) {
        return { success: false, error: "Device has no settings field", deviceData };
      }
      
      const currentTemp = deviceData.settings?.temperature;
      
      if (currentTemp === undefined || currentTemp === null) {
        return { success: false, error: "No temperature reading available", deviceData };
      }
      
      const currentTempNum = Number(currentTemp);
      const triggerValueNum = Number(automation.triggerValue);
      
      if (isNaN(currentTempNum)) {
        return { success: false, error: `Current temperature is not a valid number: ${currentTemp}` };
      }
      
      if (isNaN(triggerValueNum)) {
        return { success: false, error: `Trigger value is not a valid number: ${automation.triggerValue}` };
      }
      
      console.log(`Current temperature: ${currentTempNum}°C, Trigger value: ${triggerValueNum}°C, Comparison: ${automation.trigger}`);
      
      let shouldTrigger = false;
      let evaluationString = "";
      
      if (automation.trigger === "Temperature Above") {
        shouldTrigger = currentTempNum > triggerValueNum;
        evaluationString = `${currentTempNum} > ${triggerValueNum} = ${shouldTrigger}`;
        console.log(`Temperature Above evaluation: ${evaluationString}`);
      } else if (automation.trigger === "Temperature Below") {
        shouldTrigger = currentTempNum < triggerValueNum;
        evaluationString = `${currentTempNum} < ${triggerValueNum} = ${shouldTrigger}`;
        console.log(`Temperature Below evaluation: ${evaluationString}`);
      }
      
      if (!shouldTrigger) {
        console.log(`Temperature condition not met`);
        return { 
          success: true, 
          executed: false, 
          message: `Temperature condition not met: ${currentTempNum}°C not ${automation.trigger === "Temperature Above" ? "greater than" : "less than"} ${triggerValueNum}°C`,
          currentTemp: currentTempNum,
          triggerValue: triggerValueNum,
          evaluation: evaluationString,
          deviceData: { 
            id: triggerDeviceId,
            name: deviceData.deviceName || deviceData.name, 
            settings: deviceData.settings 
          }
        };
      }
      
      console.log(`Executing temperature-based automation: ${automationId}`);
      const result = await executeAutomation(automation);
      
      // Add debug information to the result
      if (result.success) {
        result.currentTemp = currentTempNum;
        result.triggerValue = triggerValueNum;
        result.evaluation = evaluationString;
      }
      
      return result;
    }
    
    return { success: false, error: "Unknown or unsupported trigger type" };
  } catch (error) {
    console.error("Error force checking automation:", error);
    return { success: false, error: error.message };
  }
}; 