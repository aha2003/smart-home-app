import React, { useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, Modal, Alert } from 'react-native';
import { styles } from "./LoginStyles";
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { auth } from "../../backend/firebaseConfig";

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ visible, onClose, onSuccess }) => {
  const [oldPassword, setOldPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const oldPasswordRef = useRef<TextInput>(null);
  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const handlePasswordChange = async () => {
    if (newPassword === confirmPassword) {
      try {
        const user = auth.currentUser;
        if (!user) {
          Alert.alert("Error", "User is not authenticated.");
          return;
        }

        if (!user.email) {
          Alert.alert("Error", "User email is not available.");
          return; // Exit if email is null
        }

        const credential = EmailAuthProvider.credential(user.email, oldPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        Alert.alert("Success", "Password changed successfully!");
        onSuccess(); // Call onSuccess to close modal and reset fields
      } catch (error) {
        const e = error as Error;
        Alert.alert("Error", e.message);
      }
    } else {
      Alert.alert("Error", "New password and confirmation do not match.");
    }
  };

  useEffect(() => {
    if (visible) {
      // Focus on the first input when the modal opens
      oldPasswordRef.current?.focus();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Change Password</Text>
          
          <TextInput
            ref={oldPasswordRef}
            style={styles.modalInput}
            placeholder="Current Password"
            secureTextEntry
            value={oldPassword}
            onChangeText={setOldPassword}
          />
          
          <TextInput
            ref={newPasswordRef}
            style={styles.modalInput}
            placeholder="New Password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <TextInput
            ref={confirmPasswordRef}
            style={styles.modalInput}
            placeholder="Confirm New Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={onClose}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalButtonPrimary]}
              onPress={handlePasswordChange}
            >
              <Text style={styles.modalButtonTextPrimary}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ChangePasswordModal; 