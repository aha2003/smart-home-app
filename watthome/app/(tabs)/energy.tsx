import React, { useState, useRef } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text, Dimensions, ScrollView, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BarChart as RNBarChart } from 'react-native-chart-kit';
import {StackedBarChart} from 'react-native-chart-kit';
import Animated, { useAnimatedStyle, withSpring, useSharedValue, interpolate } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { styles } from "./LoginStyles";


const NavBar = () => {
  const isDesktop = Platform.OS === 'web';

  return (
    <View style={[styles.navBar, isDesktop ? styles.desktopEnergyNav : styles.mobileEnergyNav]}>
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
            size={35} 
            color="white" 
            
          />
        </TouchableOpacity>
      </Link>

      <Link href="/energy" asChild>
        <TouchableOpacity>
          <MaterialCommunityIcons 
            name="lightning-bolt" 
            size={45} 
            color="white"
            style={styles.glowIcon}
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
            name="cog" 
            size={35} 
            color="white"
          />
        </TouchableOpacity>
      </Link>
    </View>
  );
};

// Add type definitions
type ChartData = {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    legend?: string;
  }[];
};

const { width: screenWidth } = Dimensions.get('window');

// Create a wrapper component for the BarChart to handle types properly
const BarChart = (props: any) => {
  return <RNBarChart {...props} />;
};

type TimeSelectorProps = {
  selectedTime: string;
  onTimeSelect: (time: string) => void;
};

const TimeSelector: React.FC<TimeSelectorProps> = ({ selectedTime, onTimeSelect }) => {
  const getCurrentTimeRange = (type: string) => {
    const now = new Date();
    switch (type) {
      case 'day':
        return now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      case 'month':
        return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'year':
        return now.getFullYear().toString();
      default:
        return '';
    }
  };

  return (
    <View style={styles.timeSelector}>
      {['day', 'week', 'month', 'year'].map((time) => (
        <TouchableOpacity
          key={time}
          style={[styles.timeButton, selectedTime === time && styles.selectedTimeButton]}
          onPress={() => onTimeSelect(time)}
        >
          <Text style={[styles.timeButtonText, selectedTime === time && styles.selectedTimeButtonText]}>
            {selectedTime === time ? getCurrentTimeRange(time) : time.charAt(0).toUpperCase() + time.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

type RoomSliderProps = {
  selectedTime: string;
};

const RoomSlider: React.FC<RoomSliderProps> = ({ selectedTime }) => {
  const rooms = ['Living Room', 'Kitchen', 'Bedroom', 'Kids Room'];
  const [activeIndex, setActiveIndex] = useState(0);
  const translateX = useSharedValue(0);
  const itemWidth = screenWidth - 40;

  const getChartData = (room: string) => {
    const data = {
      day: {
        labels: ['6am', '9am', '12pm', '3pm', '6pm', '9pm'],
        data: [2.5, 3.8, 4.2, 3.9, 4.5, 3.2],
      },
      week: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [15.2, 14.8, 16.3, 15.9, 17.2, 13.8, 12.5],
      },
      month: {
        labels: ['W1', 'W2', 'W3', 'W4'],
        data: [65.3, 58.9, 62.4, 59.8],
      },
      year: {
        labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
        data: [280, 310, 290, 350, 320, 285],
      },
    };
    return data[selectedTime as keyof typeof data];
  };

  const gesture = Gesture.Pan()
    .onBegin(() => {
      translateX.value = activeIndex * -itemWidth;
    })
    .onUpdate((e) => {
      translateX.value = activeIndex * -itemWidth + e.translationX;
    })
    .onEnd((e) => {
      const velocity = e.velocityX;
      const shouldSwipe = Math.abs(e.translationX) > itemWidth * 0.3 || Math.abs(velocity) > 400;
      
      let newIndex = activeIndex;
      if (shouldSwipe) {
        if (e.translationX > 0) {
          newIndex = Math.max(0, activeIndex - 1);
        } else {
          newIndex = Math.min(rooms.length - 1, activeIndex + 1);
        }
      }
      
      translateX.value = withSpring(newIndex * -itemWidth, {
        velocity: velocity,
        damping: 20,
      });
      setActiveIndex(newIndex);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.sliderContainer}>
      <View style={styles.roomIndicators}>
        {rooms.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              setActiveIndex(index);
              translateX.value = withSpring(index * -itemWidth);
            }}
          >
            <View style={[
              styles.roomIndicator,
              activeIndex === index && styles.activeRoomIndicator
            ]} />
          </TouchableOpacity>
        ))}
      </View>
      <GestureDetector gesture={gesture}>
        <View style={styles.sliderWrapper}>
          <Animated.View style={[styles.slider, animatedStyle]}>
            {rooms.map((room, index) => {
              const chartData = getChartData(room);
              return (
                <View key={index} style={[styles.roomCard, { width: itemWidth }]}>
                  <Text style={styles.roomTitle}>{room}</Text>
                  <BarChart
                    data={{
                      labels: chartData.labels,
                      datasets: [{ data: chartData.data }],
                    }}
                    width={itemWidth - 20}
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix=" kW"
                    chartConfig={{
                      backgroundColor: '#001322',
                      backgroundGradientFrom: '#001322',
                      backgroundGradientTo: '#001322',
                      decimalPlaces: 1,
                      color: (opacity = 100) => `rgba(245, 245, 245, ${opacity})`,
                      labelColor: (opacity = 100) => `rgba(255, 255, 255, ${opacity})`,
                      style: {
                        borderRadius: 16,
                      },
                    }}
                    style={styles.chart}
                  />
                </View>
              );
            })}
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
};

type SolarGenerationProps = {
  selectedTime: string;
};

const SolarGeneration: React.FC<SolarGenerationProps> = ({ selectedTime }) => {
  const getChartData = () => {
    const data = {
      day: {
        labels: ['6am', '9am', '12pm', '3pm', '6pm', '9pm'],
        data: [0.2, 2.8, 4.5, 4.2, 2.1, 0.1],
      },
      week: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [12.5, 13.8, 11.2, 14.5, 12.8, 13.2, 12.9],
      },
      month: {
        labels: ['W1', 'W2', 'W3', 'W4'],
        data: [45.3, 48.9, 52.4, 49.8],
      },
      year: {
        labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
        data: [180, 210, 290, 350, 320, 185],
      },
    };
    return data[selectedTime as keyof typeof data];
  };

  const chartData = getChartData();

  const { width } = useWindowDimensions(); // Get screen width

  const chart_style = width > 768 ? styles.desktop_chart_style : styles.mobile_chart_style; 


  return (
    <View style={chart_style}>
      <Text style={styles.cardTitle}>Solar Energy Generation</Text>
      <BarChart
        data={{
          labels: chartData.labels,
          datasets: [{ data: chartData.data }],
        }}
        width={screenWidth - 40}
        height={240}
        yAxisLabel=""
        yAxisSuffix=" kW"
        chartConfig={{
          backgroundColor: '#001322',
          // backgroundGradientFrom: '#001322',
          // backgroundGradientTo: '#001322',
          decimalPlaces: 1,
          //color: (opacity = 100) => `rgba(245, 245, 245, ${opacity})`,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 100) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        style={styles.chart}
      />
    </View>
  );
};

type DeviceUsageProps = {
  selectedTime: string;
};

const DeviceUsage: React.FC<DeviceUsageProps> = ({ selectedTime }) => {
  const getChartData = () => {
    const devices = ['TV', 'Thermostat', 'Smart Lights', 'Washing Machine', 'CCTV', 'Roomba'];
    const data = {
      day: {
        labels: ['6am', '9am', '12pm', '3pm', '6pm', '9pm'],
        datasets: devices.map((device, index) => ({
          data: [0.5, 0.8, 1.2, 0.9, 1.5, 0.7].map(v => v * (index + 1)),
          color: (opacity = 1) => [
            `rgba(255, 99, 132, ${opacity})`,
            `rgba(54, 162, 235, ${opacity})`,
            `rgba(255, 206, 86, ${opacity})`,
            `rgba(75, 192, 192, ${opacity})`,
            `rgba(153, 102, 255, ${opacity})`,
            `rgba(255, 159, 64, ${opacity})`,
          ][index],
          legend: device,
        })),
      },
      week: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: devices.map((device, index) => ({
          data: [3.2, 3.8, 4.1, 3.9, 4.2, 3.5, 3.0].map(v => v * (index + 1)),
          color: (opacity = 1) => [
            `rgba(255, 99, 132, ${opacity})`,
            `rgba(54, 162, 235, ${opacity})`,
            `rgba(255, 206, 86, ${opacity})`,
            `rgba(75, 192, 192, ${opacity})`,
            `rgba(153, 102, 255, ${opacity})`,
            `rgba(255, 159, 64, ${opacity})`,
          ][index],
          legend: device,
        })),
      },
      month: {
        labels: ['W1', 'W2', 'W3', 'W4'],
        datasets: devices.map((device, index) => ({
          data: [15.5, 16.2, 14.8, 15.9].map(v => v * (index + 1)),
          color: (opacity = 1) => [
            `rgba(255, 99, 132, ${opacity})`,
            `rgba(54, 162, 235, ${opacity})`,
            `rgba(255, 206, 86, ${opacity})`,
            `rgba(75, 192, 192, ${opacity})`,
            `rgba(153, 102, 255, ${opacity})`,
            `rgba(255, 159, 64, ${opacity})`,

          ][index],
          legend: device,
        })),
      },
      year: {
        labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
        datasets: devices.map((device, index) => ({
          data: [180, 210, 290, 350, 320, 185].map(v => v * (index + 0.5)),
          color: (opacity = 1) => [
            `rgba(255, 99, 132, ${opacity})`,
            `rgba(54, 162, 235, ${opacity})`,
            `rgba(255, 206, 86, ${opacity})`,
            `rgba(75, 192, 192, ${opacity})`,
            `rgba(153, 102, 255, ${opacity})`,
            `rgba(255, 159, 64, ${opacity})`,
          ][index],
          legend: device,
        })),
      },
    };
    return data[selectedTime as keyof typeof data];
  };

  const chartData = getChartData();


  const { width } = useWindowDimensions(); // Get screen width

  const chart_style = width > 768 
  ? styles.desktop_chart_style 
  : [styles.mobile_chart_style, { marginBottom: 175 }];



  return (
    <View style={chart_style}>
      <Text style={styles.cardTitle}>Individual Device Usage</Text>
      <BarChart
        data={{
          labels: chartData.labels,
          datasets: chartData.datasets,
        }}
        width={screenWidth - 40}
        height={240}
        yAxisLabel=""
        yAxisSuffix=" kW"
        chartConfig={{
          backgroundColor: '#001322',
          backgroundGradientFrom: '#001322',
          backgroundGradientTo: '#001322',
          decimalPlaces: 1,
          color: (opacity = 100) => `rgba(245, 245, 245, ${opacity})`,
          labelColor: (opacity = 100) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        style={styles.chart}
        fromZero
        showValuesOnTopOfBars
      />
      <View style={styles.legend}>
        {chartData.datasets.map((dataset, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: dataset.color(1) }]} />
            <Text style={styles.legendText}>{dataset.legend}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const Energy = () => {
  const [selectedTime, setSelectedTime] = useState('day');

  const { width } = useWindowDimensions(); // Get screen width

  const containerStyle = width > 768 ? styles.desktop_energy_container : styles.mobile_energy_container; 

  const chart_style = width > 768 ? styles.desktop_chart_style : styles.mobile_chart_style; 




  return (
    
    <View style={containerStyle}>
      <NavBar />
      <ScrollView style={styles.scrollView}>
        <TimeSelector selectedTime={selectedTime} onTimeSelect={setSelectedTime} />
        <View style={chart_style}>
        <Text style={styles.cardTitle}>Electricity Consumption</Text>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <RoomSlider selectedTime={selectedTime} />
          </GestureHandlerRootView>
        </View>
        <SolarGeneration selectedTime={selectedTime} />
        <DeviceUsage selectedTime={selectedTime} />
      </ScrollView>
    </View>   
  );
};


export default Energy;