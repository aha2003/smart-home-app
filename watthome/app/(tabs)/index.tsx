// import { Image, StyleSheet, Platform } from 'react-native';

// import { HelloWave } from '@/components/HelloWave';
// import ParallaxScrollView from '@/components/ParallaxScrollView';
// import { ThemedText } from '@/components/ThemedText';
// import { ThemedView } from '@/components/ThemedView';

// export default function HomeScreen() {
//   return (
//     <ParallaxScrollView
//       headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
//       headerImage={
//         <Image
//           source={require('@/assets/images/partial-react-logo.png')}
//           style={styles.reactLogo}
//         />
//       }>
//       <ThemedView style={styles.titleContainer}>
//         <ThemedText type="title">Welcome!</ThemedText>
//         <HelloWave />
//       </ThemedView>
//       <ThemedView style={styles.stepContainer}>
//         <ThemedText type="subtitle">Step 1: Try it</ThemedText>
//         <ThemedText>
//           Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
//           Press{' '}
//           <ThemedText type="defaultSemiBold">
//             {Platform.select({
//               ios: 'cmd + d',
//               android: 'cmd + m',
//               web: 'F12'
//             })}
//           </ThemedText>{' '}
//           to open developer tools.
//         </ThemedText>
//       </ThemedView>
//       <ThemedView style={styles.stepContainer}>
//         <ThemedText type="subtitle">Step 2: Explore</ThemedText>
//         <ThemedText>
//           Tap the Explore tab to learn more about what's included in this starter app.
//         </ThemedText>
//       </ThemedView>
//       <ThemedView style={styles.stepContainer}>
//         <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
//         <ThemedText>
//           When you're ready, run{' '}
//           <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
//           <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
//           <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
//           <ThemedText type="defaultSemiBold">app-example</ThemedText>.
//         </ThemedText>
//       </ThemedView>
//     </ParallaxScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   titleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   stepContainer: {
//     gap: 8,
//     marginBottom: 8,
//   },
//   reactLogo: {
//     height: 178,
//     width: 290,
//     bottom: 0,
//     left: 0,
//     position: 'absolute',
//   },
// });







import React, { useState } from "react";
import "./login.css";


const login: React.FC = () => {
 // Removed duplicate defaultForm function


 const defaultForm = () => (
   <div>
     <div className="logo">
       <img
         src="watthomelogomain.png"
         alt="WATTHOME Logo"
       />
     </div>
     <button className="login-btn" onClick={loginCard}>
       Login
     </button>
     <p className="text">Don’t have an account?</p>
     <button className="signup-btn" onClick={signupCard}>
       Signup
     </button>
   </div>
 );


 const [formContent, setFormContent] = useState<JSX.Element>(defaultForm());


 const loginCard = () => {
   setFormContent(
     <div>
       <div className="text-left">
         <button className="back-arrow-btn" onClick={resetCard}>
           ←
         </button>
       </div>
       <div className="logo">
         <img
           src="watthomelogomain.png"
           alt="WATTHOME Logo"
         />
       </div>
       <form
         onSubmit={(e) => {
           e.preventDefault();
           if (validateForm()) alert("Login successful!");
         }}
       >
         <input type="text" id="username" placeholder="Username" required />
         <small id="usernameError" className="error-message">
           Please enter a valid Email address.
         </small>
         <input type="password" id="password" placeholder="Password" required />
         <small id="passwordError" className="error-message">
           Password must be at least 8 characters long.
         </small>
         <p>
           <a href="#" className="link-light">
             Forgot Password?
           </a>
         </p>
         <button type="submit">Login</button>
         <p className="text">-------- Or, Sign up --------</p>
         <button type="button" onClick={signupCard}>
           Sign up
         </button>
       </form>
     </div>
   );
 };


 const signupCard = () => {
   setFormContent(
     <div>
       <div className="text-left">
         <button className="back-arrow-btn" onClick={resetCard}>
           ←
         </button>
       </div>
       <div className="logo">
         <img
           src="watthomelogomain.png"
           alt="WATTHOME Logo"
         />
       </div>
       <input type="text" placeholder="Enter Passkey" />
       <button onClick={nextSignup}>Sign up</button>
     </div>
   );
 };


 const nextSignup = () => {
   setFormContent(
     <div>
       <div className="text-left">
         <button className="back-arrow-btn" onClick={signupCard}>
           ←
         </button>
       </div>
       <div className="logo">
         <img
           src="watthomelogomain.png"
           alt="WATTHOME Logo"
         />
       </div>
       <input type="text" placeholder="Create Username" />
       <input type="password" placeholder="Create Password" />
       <input type="password" placeholder="Confirm Password" />
       <button onClick={() => alert("Signup successful!")}>Sign up</button>
     </div>
   );
 };


 const resetCard = () => {
   setFormContent(defaultForm());
 };


 const validateForm = (): boolean => {
   const usernameInput = document.getElementById("username") as HTMLInputElement;
   const usernameError = document.getElementById("usernameError") as HTMLElement;
   const passwordInput = document.getElementById("password") as HTMLInputElement;
   const passwordError = document.getElementById("passwordError") as HTMLElement;


   let isValid = true;
   const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;


   if (!gmailRegex.test(usernameInput.value)) {
     usernameError.style.display = "block";
     isValid = false;
   } else {
     usernameError.style.display = "none";
   }


   if (passwordInput.value.length < 8) {
     passwordError.style.display = "block";
     isValid = false;
   } else {
     passwordError.style.display = "none";
   }


   return isValid;
 };




 return (
   <div className="container">
     <div className="card">{formContent}</div>
   </div>
 );
};


export default login;
