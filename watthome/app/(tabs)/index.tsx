
import React, { useState } from "react";
import { auth } from "./firebase"; // Ensure Firebase is properly set up
import { signInWithEmailAndPassword } from "firebase/auth";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ImageBackground,
  useWindowDimensions,
}  from "react-native";
import { styles } from "./LoginStyles";
import Home from "./home";

const Login = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passkey, setPasskey] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passkeyError, setPasskeyError] = useState("");
  const [formContent, setFormContent] = useState("default");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const validateForm = () => {
    let isValid = true;
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!gmailRegex.test(username)) {
      setUsernameError("Please enter a valid Gmail address.");
      isValid = false;
    } else {
      setUsernameError("");
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      isValid = false;
    } else {
      setPasswordError("");
    }

    return isValid;
  };

  const validatePasskey = () => {
    const digitRegex = /^\d{6}$/;
    
    if (!digitRegex.test(passkey)) {
      setPasskeyError("Passkey must be exactly 6 digits.");
      return false;
    }
    setPasskeyError("");
    return true;
  };




  const renderForm = (formType: string) => {
    return (
      <View style={[styles.card, isDesktop ? styles.desktopCard : styles.mobileCard]}>
        {formType === "default" && (
          <>
            <Image 
              source={require("./logo.png")} 
              style={[styles.logo, isDesktop ? styles.desktopLogo : styles.mobileLogo]} 
            />
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => setFormContent("login")}
            >
              <Text style={styles.btnText}>Login</Text>
            </TouchableOpacity>
            <Text style={styles.text}> Don't have an account? </Text>
            <TouchableOpacity
              style={styles.signupBtn}
              onPress={() => setFormContent("signup")}
            >
              <Text style={styles.btnText}>Signup</Text>
            </TouchableOpacity>
          </>
        )}

        {formType === "login" && (
          <>
            <TouchableOpacity
              style={styles.backArrowBtn}
              onPress={() => setFormContent("default")}
            >
              <Text style={styles.backArrowText}>←</Text>
            </TouchableOpacity>
            <Image 
              source={require("./logo.png")} 
              style={[styles.logo, isDesktop ? styles.desktopLogo : styles.mobileLogo]} 
            />
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
            />
            {usernameError ? (
              <Text style={styles.errorMessage}>{usernameError}</Text>
            ) : null}
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            {passwordError ? (
              <Text style={styles.errorMessage}>{passwordError}</Text>
            ) : null}

            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
              <Text style={styles.btnText}>Login</Text>
            </TouchableOpacity>
            

            <Text style={styles.text}> Or, Sign up </Text>
            <TouchableOpacity
              style={styles.signupBtn}
              onPress={() => setFormContent("signup")}
            >
              <Text style={styles.btnText}>Signup</Text>
            </TouchableOpacity>
          </>
        )}

        {formType === "signup" && (
          <>
            <TouchableOpacity
              style={styles.backArrowBtn}
              onPress={() => setFormContent("default")}
            >
              <Text style={styles.backArrowText}>←</Text>
            </TouchableOpacity>
            <Image 
              source={require("./logo.png")} 
              style={[styles.logo, isDesktop ? styles.desktopLogo : styles.mobileLogo]} 
            />
            <TextInput 
              style={styles.input} 
              placeholder="Enter Passkey (6 digits)" 
              value={passkey}
              onChangeText={setPasskey}
              keyboardType="numeric"
              maxLength={6}
            />
            {passkeyError ? (
              <Text style={styles.errorMessage}>{passkeyError}</Text>
            ) : null}
            
            <TouchableOpacity
              style={styles.signupBtn}
              onPress={() => {
                if (validatePasskey()) {
                  setFormContent("signup_more"); // Only navigate if passkey is valid
                }
              }}
            >
              <Text style={styles.btnText}>Sign up</Text>
            </TouchableOpacity>
          </>
        )}

        {formType === "signup_more" && (
          <>
            <TouchableOpacity
              style={styles.backArrowBtn}
              onPress={() => setFormContent("signup")}
            >
              <Text style={styles.backArrowText}>←</Text>
            </TouchableOpacity>
            <Image 
              source={require("./logo.png")} 
              style={[styles.logo, isDesktop ? styles.desktopLogo : styles.mobileLogo]} 
            />
            <TextInput
              style={styles.input}
              placeholder="Create Username"
              value={username}
              onChangeText={setUsername}
            />
            {usernameError ? (
              <Text style={styles.errorMessage}>{usernameError}</Text>
            ) : null}
            <TextInput
              style={styles.input}
              placeholder="Create Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            {passwordError ? (
              <Text style={styles.errorMessage}>{passwordError}</Text>
            ) : null}

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            {passwordError ? (
              <Text style={styles.errorMessage}>{passwordError}</Text>
            ) : null}

            <TouchableOpacity
              style={styles.signupBtn}
              onPress={() => setIsLoggedIn(true)}
            >
              <Text style={styles.btnText}>Sign up</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  const handleLogin = () => {
    if (validateForm()) {
      setIsLoggedIn(true);
    }
  };

  const handleSignup = () => {
    if (validateForm()) {
      setIsLoggedIn(true);
    }
  };


  if (isLoggedIn) {
    return <Home />;
  }

  return (
    <ImageBackground
      source={require("./background.png")}
      style={styles.background}
    >
      {renderForm(formContent)}
    </ImageBackground>
  );
};


export default Login;
