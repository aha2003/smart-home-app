import React, { useEffect, useRef, useState } from "react";
import { View, TextInput, TouchableOpacity, Text, Modal, Alert, ActivityIndicator } from "react-native";
import { styles } from "./LoginStyles";
import firestore from "@react-native-firebase/firestore";

interface CheckUserModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CheckUserModal: React.FC<CheckUserModalProps> = ({ visible, onClose, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const resetFields = () => {
    setEmail("");
    setEnteredPassword("");
  };

  const handleCheckUser = async () => {
    if (!email || !enteredPassword) {
      Alert.alert("Error", "Both fields are required.");
      return;
    }

    try {
      setLoading(true);
      
      // Fetch user data from Firestore
      const userDoc = await firestore().collection("users").doc(email).get();
      
      if (!userDoc.exists) {
        Alert.alert("Error", "User not found.");
        return;
      }

      const storedPassword = userDoc.data()?.password;
      
      if (enteredPassword !== storedPassword) {
        Alert.alert("Error", "Incorrect password.");
        return;
      }

      Alert.alert("Success", "User authenticated successfully!");
      resetFields();
      onSuccess();

    } catch (error) {
      console.error("Error checking user:", error);
      Alert.alert("Error", "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      emailRef.current?.focus();
    } else {
      resetFields();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Check User</Text>

          <TextInput
            ref={emailRef}
            style={styles.modalInput}
            placeholder="Enter Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            ref={passwordRef}
            style={styles.modalInput}
            placeholder="Enter Password"
            secureTextEntry
            value={enteredPassword}
            onChangeText={setEnteredPassword}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                resetFields();
                onClose();
              }}
              disabled={loading}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonPrimary]}
              onPress={handleCheckUser}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalButtonTextPrimary}>Check</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CheckUserModal;
