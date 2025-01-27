// import React, { useState } from "react";
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ImageBackground } from "react-native";

// const Login = () => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [usernameError, setUsernameError] = useState("");
//   const [passwordError, setPasswordError] = useState("");
//   const [formContent, setFormContent] = useState("default");

//   const validateForm = () => {
//     let isValid = true;
//     const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

//     if (!gmailRegex.test(username)) {
//       setUsernameError("Please enter a valid Gmail address.");
//       isValid = false;
//     } else {
//       setUsernameError("");
//     }

//     if (password.length < 8) {
//       setPasswordError("Password must be at least 8 characters long.");
//       isValid = false;
//     } else {
//       setPasswordError("");
//     }

//     return isValid;
//   };

//   const handleLogin = () => {
//     if (validateForm()) {
//       Alert.alert("Login successful!");
//     }
//   };

//   const defaultForm = (
//     <View style={styles.container}>
//       <View style={styles.logo}>
//         <Text style={styles.logoText}>WATTHOME Logo</Text>
//       </View>
//       <TouchableOpacity style={styles.loginBtn} onPress={() => setFormContent("login")}>
//         <Text style={styles.btnText}>Login</Text>
//       </TouchableOpacity>
//       <Text style={styles.text}>Don’t have an account?</Text>
//       <TouchableOpacity style={styles.signupBtn} onPress={() => setFormContent("signup")}>
//         <Text style={styles.btnText}>Signup</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   const loginForm = (
//     <View style={styles.container}>
//       <TouchableOpacity style={styles.backArrowBtn} onPress={() => setFormContent("default")}>
//         <Text style={styles.backArrowText}>←</Text>
//       </TouchableOpacity>
//       <View style={styles.logo}>
//         <Text style={styles.logoText}>WATTHOME Logo</Text>
//       </View>
//       <TextInput
//         style={styles.input}
//         placeholder="Username"
//         value={username}
//         onChangeText={setUsername}
//       />
//       {usernameError ? <Text style={styles.errorMessage}>{usernameError}</Text> : null}
//       <TextInput
//         style={styles.input}
//         placeholder="Password"
//         secureTextEntry
//         value={password}
//         onChangeText={setPassword}
//       />
//       {passwordError ? <Text style={styles.errorMessage}>{passwordError}</Text> : null}
//       <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
//         <Text style={styles.btnText}>Login</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   const signupForm = (
//     <View style={styles.container}>
//       <TouchableOpacity style={styles.backArrowBtn} onPress={() => setFormContent("default")}>
//         <Text style={styles.backArrowText}>←</Text>
//       </TouchableOpacity>
//       <View style={styles.logo}>
//         <Text style={styles.logoText}>WATTHOME Logo</Text>
//       </View>
//       <TextInput style={styles.input} placeholder="Enter Passkey" />
//       <TouchableOpacity style={styles.signupBtn} onPress={() => Alert.alert("Signup successful!")}>
//         <Text style={styles.btnText}>Sign up</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   return formContent === "login" ? loginForm : formContent === "signup" ? signupForm : defaultForm;
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//     backgroundColor: "#fff",
//   },
//   logo: {
//     marginBottom: 20,
//   },
//   logoText: {
//     fontSize: 24,
//     fontWeight: "bold",
//   },
//   loginBtn: {
//     backgroundColor: "#007bff",
//     padding: 10,
//     borderRadius: 5,
//     marginBottom: 10,
//   },
//   signupBtn: {
//     backgroundColor: "#28a745",
//     padding: 10,
//     borderRadius: 5,
//   },
//   btnText: {
//     color: "#fff",
//     fontSize: 16,
//   },
//   text: {
//     marginVertical: 10,
//     fontSize: 16,
//   },
//   backArrowBtn: {
//     alignSelf: "flex-start",
//     padding: 10,
//   },
//   backArrowText: {
//     fontSize: 24,
//   },
//   input: {
//     width: "100%",
//     padding: 10,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 5,
//     marginBottom: 10,
//   },
//   errorMessage: {
//     color: "red",
//     marginBottom: 10,
//   },
// });

// export default Login;




import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ImageBackground,
} from "react-native";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formContent, setFormContent] = useState("default");

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

  const handleLogin = () => {
    if (validateForm()) {
      Alert.alert("Login successful!");
    }
  };

  const renderForm = (formType: string) => {
    return (
      <View style={styles.card}>
        {formType === "default" && (
          <>
            <Image source={require("./logo.png")} style={styles.logo} />
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => setFormContent("login")}
            >
              <Text style={styles.btnText}>Login</Text>
            </TouchableOpacity>
            <Text style={styles.text}>Don’t have an account?</Text>
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
            <Image source={require("./logo.png")} style={styles.logo} />
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
            <Image source={require("./logo.png")} style={styles.logo} />
            <TextInput style={styles.input} placeholder="Enter Passkey" />
            <TouchableOpacity
              style={styles.signupBtn}
              onPress={() => Alert.alert("Signup successful!")}
            >
              <Text style={styles.btnText}>Sign up</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  return (
    <ImageBackground
      source={require("./background.png")}
      style={styles.background}
    >
      {renderForm(formContent)}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "28%",
    height: "65%",
    backgroundColor: "rgba(0, 19, 34, 0.89)",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  logo: {
    width: "95%",
    height: "50%",
    marginBottom: 20,
  },
  loginBtn: {
    backgroundColor: "#D49C6E",
    padding: 15,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  signupBtn: {
    backgroundColor: "#D49C6E",
    padding: 15,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  btnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  text: {
    color: "#FFF",
    marginVertical: 10,
  },
  backArrowBtn: {
    alignSelf: "flex-start",
  },
  backArrowText: {
    fontSize: 24,
    color: "#FFF",
  },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#FFF",
    marginBottom: 10,
  },
  errorMessage: {
    color: "red",
    marginBottom: 10,
  },
});

export default Login;
