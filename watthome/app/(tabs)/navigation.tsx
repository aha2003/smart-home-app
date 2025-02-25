// // Navigation.tsx
// import React from 'react';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import Home from './home';
// import Devices from './devices';
// import Automation from './automation';
// import Energy from './energy';
// import Settings from './settings';
// import { MaterialCommunityIcons } from '@expo/vector-icons';

// const Tab = createBottomTabNavigator();

// const Navigation = () => {
//   return (
//     <Tab.Navigator
//       screenOptions={({ route }) => ({
//         tabBarIcon: ({ color, size }) => {
//           let iconName: string;


//           switch (route.name) {
//             case 'Home':
//               iconName = 'home-outline';
//               break;
//             case 'Devices':
//               iconName = 'devices';
//               break;
//             case 'Energy':
//               iconName = 'lightning-bolt';
//               break;
//             case 'Automation':
//               iconName = 'robot-industrial';
//               break;
//             case 'Settings':
//               iconName = 'decagram-outline';
//               break;
//             default:
//               iconName = 'alert-circle-outline'; // Fallback icon
//           }

//           // Ensure the `name` prop is passed correctly


//           type IconName = 'home-outline' | 'devices' | 'lightning-bolt' | 'robot-industrial' | 'decagram-outline';

//           return <MaterialCommunityIcons name={iconName as IconName} size={size} color={color} />;



//           //return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
//         },
//         tabBarActiveTintColor: 'blue',
//         tabBarInactiveTintColor: 'gray',
//       })}
//     >
//       <Tab.Screen name="Home" component={Home} />
//       <Tab.Screen name="Devices" component={Devices} />
//       <Tab.Screen name="Energy" component={Energy} />
//       <Tab.Screen name="Automation" component={Automation} />
//       <Tab.Screen name="Settings" component={Settings} />
//     </Tab.Navigator>
//   );
// };

// export default Navigation;
