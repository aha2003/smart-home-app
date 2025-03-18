import { db } from './firebaseConfig';
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

// Function to add a new device
export const addDevice = async (userId, deviceName, deviceType, energyUsage) => {
  try {
    const docRef = await addDoc(collection(db, "devices"), {
      userId,
      deviceName,
      deviceType,
      energyUsage,
      totalEnergy: 0, // Initialize total energy
      createdAt: new Date(),
    });
    return { success: true, id: docRef.id };
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