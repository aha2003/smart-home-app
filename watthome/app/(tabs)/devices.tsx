import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet,Platform, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from "./LoginStyles";


const NavBar = () => {
  const isDesktop = Platform.OS === 'web';

  return (
    <View style={[styles.navBar, isDesktop ? styles.desktopNav : styles.mobileNav]}>
      <Link href="/" asChild>
        <TouchableOpacity>
          <MaterialCommunityIcons 
            name="home-outline" 
            size={45} 
            color="white" 
            
          />
        </TouchableOpacity>
      </Link>

      <Link href="/devices" asChild>
        <TouchableOpacity>
          <MaterialCommunityIcons 
            name="devices" 
            size={46} 
            color="white" 
            style={styles.glowIcon}
          />
        </TouchableOpacity>
      </Link>

      <Link href="/energy" asChild>
        <TouchableOpacity>
          <MaterialCommunityIcons 
            name="lightning-bolt" 
            size={38} 
            color="white"
          />
        </TouchableOpacity>
      </Link>

      <Link href="/automation" asChild>
        <TouchableOpacity>
          <MaterialCommunityIcons 
            name="robot-industrial" 
            size={35} 
            color="white"
          />
        </TouchableOpacity>
      </Link>

      <Link href="/settings" asChild>
        <TouchableOpacity>
          <MaterialCommunityIcons 
            name="decagram-outline" 
            size={35} 
            color="white"
          />
        </TouchableOpacity>
      </Link>
    </View>
  );
};


const devices: { id: number; name: string; location: string; icon: 'lightbulb-outline' | 'thermometer' | 'cctv' | 'television' | 'robot-vacuum' | 'washing-machine' }[] = [
  { id: 1, name: 'Smart Light', location: 'Living Room', icon: 'lightbulb-outline' },
  { id: 2, name: 'Thermostat', location: 'Living Room', icon: 'thermometer' },
  { id: 3, name: 'CCTV', location: 'Front Door', icon: 'cctv' },
  { id: 4, name: 'TV', location: 'Living Room', icon: 'television' },
  { id: 5, name: 'Smart Light', location: 'BedRoom', icon: 'lightbulb-outline' },
  { id: 6, name: 'Thermostat', location: 'Bedroom', icon: 'thermometer' },
  { id: 7, name: 'CCTV', location: 'Garage Door', icon: 'cctv' },
  { id: 8, name: 'Roomba', location: 'Kitchen', icon: 'robot-vacuum' },
  { id: 9, name: 'Smart Light', location: 'Kitchen', icon: 'lightbulb-outline' },
  { id: 10, name: 'Thermostat', location: 'Kitchen', icon: 'thermometer' },
  { id: 11, name: 'Washing Machine', location: 'Kitchen', icon: 'washing-machine' },
];

const DevicesPage = () => {
  const [activeTab, setActiveTab] = useState<'devices' | 'groups'>('devices');
  const [deviceStates, setDeviceStates] = useState<{ [key: number]: boolean }>(
    devices.reduce((acc, device) => ({ ...acc, [device.id]: false }), {})
  );
  const [temperatures, setTemperatures] = useState<{ [key: number]: number }>({});
  const [brigntness, setBrightness] = useState<{ [key: number]: number }>({});
  const [roombaSpeed, setRoombaSpeed] = useState('Medium');
  const [volume, setVolume] = useState<{ [key: number]: number }>({});
  const [washingMachineOn, setWashingMachineOn] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 mins = 1200 seconds

  


  const toggleSwitch = (id: number) => {
    setDeviceStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const increaseTemperature = (id: number) => {
    setTemperatures((prev) => ({ ...prev, [id]: (prev[id] || 23) + 1 }));
  };

  const decreaseTemperature = (id: number) => {
    setTemperatures((prev) => ({ ...prev, [id]: (prev[id] || 23) - 1 }));
  };

  const increaseBrightness = (id: number) => {
    setBrightness((prev) => ({ ...prev, [id]: (prev[id] || 75) + 5 }));
  };

  const decreaseBrightness = (id: number) => {
    setBrightness((prev) => ({ ...prev, [id]: (prev[id] || 75) - 5 }));
  };

  const increaseVolume = (id: number) => {
    setVolume((prev) => ({ ...prev, [id]: (prev[id] || 10) + 1 }));
  };

  const decreaseVolume = (id: number) => {
    setVolume((prev) => ({ ...prev, [id]: (prev[id] || 10) - 1 }));
  };

  useEffect(() => {
    if (washingMachineOn && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
  
      return () => clearInterval(timer);
    }
  }, [washingMachineOn]); 
  
  const toggleWashingMachine = () => {
    setWashingMachineOn((prev) => {
      const newState = !prev;
      if (newState) {
        setTimeLeft(1200); // Reset timer only when turning ON
      }
      return newState;
    });
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };


  const cycleRoombaSpeed = () => {
    const speeds = ['Low', 'Medium', 'High'];
    const currentIndex = speeds.indexOf(roombaSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setRoombaSpeed(speeds[nextIndex]);
  };

  return (
    <View style={styles.dev_container}>
      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'devices' && styles.activeTab]}
          onPress={() => setActiveTab('devices')}
        >
          <Text style={styles.tabText}>Devices</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'groups' && styles.activeTab]}
          onPress={() => setActiveTab('groups')}
        >
          <Text style={styles.tabText}>Device Groups</Text>
        </TouchableOpacity>
      </View>

      {/* Devices Display */}
      {activeTab === 'devices' ? (
         <ScrollView contentContainerStyle={styles.deviceGrid}>
         {devices.map((device) => (
           <View key={device.id} style={styles.deviceCard}>
             <View style={styles.deviceHeader}>
               <MaterialCommunityIcons name={device.icon} size={40} color="#fffcf2" />
               <Text style={styles.deviceName}>{device.name}</Text>
             </View>

             {device.name === 'Thermostat' && deviceStates[device.id] && (
               <View style={styles.tempControls}>
                 <TouchableOpacity onPress={() => decreaseTemperature(device.id)}>
                   <MaterialCommunityIcons name="minus-circle-outline" size={30} color="red" />
                 </TouchableOpacity>
                 <Text style={styles.tempText}>{temperatures[device.id] || 23}°C</Text>
                 <TouchableOpacity onPress={() => increaseTemperature(device.id)}>
                   <MaterialCommunityIcons name="plus-circle-outline" size={30} color="green" />
                 </TouchableOpacity>
               </View>
             )}

             {device.name === 'Smart Light' && deviceStates[device.id] && (
               <View style={styles.brightnessControls}>
                  <TouchableOpacity onPress={() => decreaseBrightness(device.id)}>
                    <MaterialCommunityIcons name="minus-circle-outline" size={30} color="red" />
                  </TouchableOpacity>
                  <Text style={styles.brightnessText}>{brigntness[device.id] || 75}%</Text>
                  <TouchableOpacity onPress={() => increaseBrightness(device.id)}>
                    <MaterialCommunityIcons name="plus-circle-outline" size={30} color="green" />
                  </TouchableOpacity>
                </View>
              )}

              {device.name === 'Roomba' && deviceStates[device.id] && (
                <View style={styles.roombaControls}>
                  <Text style={styles.roombaSpeed}>{roombaSpeed}</Text>
                  <TouchableOpacity onPress={cycleRoombaSpeed}>
                    <MaterialCommunityIcons name="reload" size={17} color="white" />
                  </TouchableOpacity>
                </View>
              )}

              {device.name === 'TV' && deviceStates[device.id] && (
                <View style={styles.volumeControls}>
                  <TouchableOpacity onPress={() => decreaseVolume(device.id)}>
                    <MaterialCommunityIcons name="volume-minus" size={30} color="red" />
                  </TouchableOpacity>
                  <Text style={styles.volumeText}>{volume[device.id] || 10}</Text>
                  <TouchableOpacity onPress={() => increaseVolume(device.id)}>
                    <MaterialCommunityIcons name="volume-plus" size={30} color="green" />
                  </TouchableOpacity>
                </View>
              )}

              {device.name === 'Washing Machine' && deviceStates[device.id] && (
                <View style={styles.controlPanel}>
                  <Switch value={washingMachineOn} onValueChange={toggleWashingMachine} />
                  <Text style={styles.deviceLocation}>
                    {washingMachineOn ? `Time Left: ${formatTime(timeLeft)}` : 'Off'}
                  </Text>
                </View>
              )}

              {device.name === 'CCTV' && deviceStates[device.id] && (
                <View style={styles.controlPanel}>
                  
                  <Text style={styles.controlText}>
                    {'Recording...'}
                  </Text>
                </View>
              )}


             <Switch value={deviceStates[device.id]} onValueChange={() => toggleSwitch(device.id)} />
             <Text style={styles.deviceLocation}>{device.location}</Text>
           </View>
         ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyView}>
          <Text>Device Groups will be shown here.</Text>
        </View>
      )}
      <NavBar />
    </View>
    
  );
};


export default DevicesPage;
