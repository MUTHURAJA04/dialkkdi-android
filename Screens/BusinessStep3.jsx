import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import Input from '../components/CustomInput';
import { postBusiness } from '../services/apiClient';

const BusinessStep3 = () => {
  const navigation = useNavigation();

  const route = useRoute();
  const { formData } = route.params;
  console.log(formData, "2 nd businessssss");


  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [photos, setPhotos] = useState([]);
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAddPhoto = () => {
    if (photos.length >= 6) return;
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 6 - photos.length,
      },
      response => {
        if (!response.didCancel && response.assets) {
          setPhotos([...photos, ...response.assets]);
        }
      },
    );
  };

  const handleRemovePhoto = index => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const handleSubmit = async () => {
    // Basic validations
    if (password.length < 6) {
      return Alert.alert('Error', 'Password must be at least 6 characters long.');
    }

    if (password !== confirmPassword) {
      return Alert.alert('Error', 'Passwords do not match.');
    }

    if (!agreed) {
      return Alert.alert('Error', 'You must agree to the terms and conditions.');
    }

    if (photos.length === 0) {
      return Alert.alert('Error', 'Please upload at least one business photo.');
    }

    try {
      const form = new FormData();

      // Append all fields from formData
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          form.append(key, value);
        }
      });

      // Append password
      form.append('password', password);

      // Append each photo
      photos.forEach((photo, index) => {
        form.append('photos', {
          uri: photo.uri,
          name: photo.fileName || `photo_${index + 1}.jpg`,
          type: photo.type || 'image/jpeg',
        });
      });

      // Send to API
      const response = await postBusiness(form);

      const type = 'business'
      const email = formData.email

      console.log('✅ Registration Response:', response, email);

      Alert.alert('Success', 'Registration complete!');
      navigation.navigate('VerifyOtp', { email, type });

    } catch (error) {
      console.error('❌ Registration Error:', {
        message: error.message,
        details: error.response?.data,
      });
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };



  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView className="flex-1 px-6 pt-16 pb-6">
        <Text className="text-2xl font-bold mb-4 text-orange-600 text-center">
          Business Registration
        </Text>
        <Text className="text-sm text-gray-500 text-center mb-6">
          Step 3 of 3
        </Text>

        <Input
          placeholder="Password"
          secureTextEntry
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
        />

        <Input
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholderTextColor="#aaa"
          isPassword
          showPassword={showPassword}
          togglePasswordVisibility={() => setShowPassword(prev => !prev)}
        />

        <Text className="text-gray-700 font-medium mb-2">
          Upload 1–6 photos of your business
        </Text>

        {photos.length > 0 ? (
          <View className="flex-row flex-wrap gap-2 mb-4">
            {photos.map((photo, index) => (
              <View key={index} className="relative">
                <Image source={{ uri: photo.uri }} className="w-20 h-20 rounded-md" />
                <TouchableOpacity
                  onPress={() => handleRemovePhoto(index)}
                  className="absolute -top-2 -right-2 bg-red-600 rounded-full w-6 h-6 items-center justify-center"
                >
                  <Text className="text-white text-xs">X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <Text className="text-gray-400 mb-4">No file chosen</Text>
        )}

        <TouchableOpacity
          onPress={handleAddPhoto}
          className={`py-3 rounded-lg mb-6 ${photos.length >= 6 ? 'bg-orange-300' : 'bg-orange-500'}`}
        >
          <Text className="text-white text-center font-semibold">Add Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setAgreed(!agreed)}
          className="flex-row items-center mb-4"
        >
          <View className={`w-5 h-5 rounded border-2 mr-3 justify-center items-center ${agreed ? 'bg-orange-500 border-orange-500' : 'border-gray-400'}`}>
            {agreed && <Text className="text-white text-xs">✓</Text>}
          </View>
          <Pressable onPress={() => setShowTerms(true)}>
            <Text className="text-gray-700">
              I agree to the{' '}
              <Text className="underline text-sky-500">Terms and Conditions</Text>
            </Text>
          </Pressable>
        </TouchableOpacity>

        <Modal
          visible={showTerms}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowTerms(false)}
        >
          <View className="flex-1 bg-black bg-opacity-40 justify-center items-center">
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <View className="bg-white w-11/12 max-h-[90%] rounded-lg p-4">
              <Text className="text-lg font-bold mb-4 text-center">
                Terms and Conditions
              </Text>
              <ScrollView className="mb-4">
                <Text className="text-gray-700 text-sm leading-5">
                  <Text className="font-bold">Last Updated: </Text>March 15,
                  2025{'\n\n'}
                  <Text className="font-bold text-base">
                    1. Service Overview{'\n'}
                  </Text>
                  <Text className="mb-3">
                    Welcome to our platform! We're a service listing and
                    information portal designed to help you find local
                    businesses and service providers easily. Think of us as a
                    bridge connecting you with plumbers, electricians, tutors,
                    caterers, and a host of other professionals. While we strive
                    to present accurate and updated information, please
                    understand that we don't directly provide these services,
                    nor do we control how they're delivered.
                    {'\n\n'}
                    We do our best to ensure details like phone numbers, prices,
                    and business hours are correct, but we can't guarantee their
                    constant accuracy. We highly recommend you verify these
                    details independently before engaging any service. Our
                    website serves purely as an informational and connection
                    tool. We are not responsible for any dealings, contracts, or
                    issues that may arise between you and a service provider
                    listed on our platform. Your use of our site is at your own
                    discretion.
                  </Text>
                  {'\n\n'}
                  <Text className="font-bold text-base">
                    2. User Responsibilities{'\n'}
                  </Text>
                  <Text className="mb-3">
                    As a user, you agree to interact with our platform
                    respectfully, lawfully, and honestly. You're responsible for
                    all activity under your account. If you sign up or submit a
                    listing, ensure all information is correct, up-to-date, and
                    not misleading.
                    {'\n\n'}• Do not use false identities, impersonate others,
                    or provide fake reviews or comments.{'\n'}• Do not upload
                    content that is abusive, illegal, offensive, pornographic,
                    or misleading.{'\n'}• Any activity that compromises the
                    safety, integrity, or smooth operation of our website is
                    strictly prohibited. This includes attempting to hack the
                    site, bypass security measures, or interfere with other
                    users.{'\n'}• Keep your login credentials safe. If you
                    notice any suspicious activity in your account or on the
                    website, please report it to us immediately.{'\n\n'}
                    We reserve the right to revoke your access if these rules
                    are violated. By using this site, you accept full
                    responsibility for your actions here.
                  </Text>
                  {'\n\n'}
                  <Text className="font-bold text-base">
                    3. Third-Party Links and External Services{'\n'}
                  </Text>
                  <Text className="mb-3">
                    Our website may contain links to external websites, mobile
                    apps, or services not owned or controlled by us. These are
                    "third-party" services. For example, clicking a business's
                    website or social media link will redirect you to a
                    different site.
                    {'\n\n'}
                    We have no control over the content, privacy policies, or
                    business practices of these external sites. Once you leave
                    our site, we are not responsible for what happens on the
                    third-party website. Any information you provide or payments
                    you make on those sites are entirely at your own risk. We
                    strongly advise you to read the terms and privacy policy of
                    any third-party site before sharing personal details or
                    proceeding with any transaction. We are not liable for any
                    loss or damage resulting from your interaction with these
                    external services.
                  </Text>
                  {'\n\n'}
                  <Text className="font-bold text-base">
                    4. Intellectual Property{'\n'}
                  </Text>
                  <Text className="mb-3">
                    Everything on our website — including text, logos, graphics,
                    images, layouts, and the site's design — is either our
                    property or used with proper legal permission. These
                    materials are protected under copyright and intellectual
                    property laws.
                    {'\n\n'}
                    This means you cannot copy, download, share, publish, or
                    modify any part of this website for personal or commercial
                    use without our written permission. This includes our name,
                    branding, content structure, and listing style. If we find
                    unauthorized use of our material, we reserve the right to
                    take legal action. If you believe any content on this site
                    violates your copyright or rights, please contact us with
                    proof, and we will investigate and take appropriate action.
                    Always respect intellectual property, just as you expect
                    others to respect yours.
                  </Text>
                  {'\n\n'}
                  <Text className="font-bold text-base">
                    5. Limitation of Liability{'\n'}
                  </Text>
                  <Text className="mb-3">
                    We provide this platform "as is," meaning we offer its
                    features and services to the best of our ability, but we
                    make no promises or guarantees about perfection. We are not
                    responsible for any damages or losses incurred from using
                    our website or the services listed here.
                    {'\n\n'}
                    For example, if a service provider delays work, performs
                    poorly, or takes your payment and disappears, we are not
                    liable. Similarly, we are not responsible for any loss you
                    face due to errors in listing information (e.g., wrong
                    address, outdated phone number) or if the website is
                    temporarily unavailable due to maintenance or technical
                    issues.
                    {'\n\n'}
                    You use our website at your own risk, and any agreements
                    between you and a service provider are your personal
                    responsibility. We also do not guarantee that the website
                    will always be free of bugs, viruses, or technical issues.
                    If you are dissatisfied with any part of the site, your sole
                    remedy is to discontinue its use.
                  </Text>
                  {'\n\n'}
                  <Text className="font-bold text-base">
                    6. Changes to These Terms{'\n'}
                  </Text>
                  <Text className="mb-3">
                    We may update or change these Terms and Conditions whenever
                    necessary, especially when we add new features or services.
                    We are not obligated to provide advance notice, but when
                    changes are made, we will update this page. It is your
                    responsibility to review this page regularly.
                    {'\n\n'}
                    Your continued use of the site after changes are made
                    signifies your acceptance of the new terms. We recommend
                    checking this section every few months, especially if you
                    are a frequent user or business partner. These updates may
                    include changes to user rules, legal rights, or platform
                    features. If you disagree with the changes, you should stop
                    using the website immediately. The most recent version of
                    the Terms and Conditions will always be available on this
                    page for your reference.
                  </Text>
                  {'\n\n'}
                  <Text className="font-bold text-base">
                    7. Governing Law and Jurisdiction{'\n'}
                  </Text>
                  <Text className="mb-3">
                    All legal matters related to this website, including its
                    use, policies, services, and users, are governed by the laws
                    of India. Any legal dispute must be handled under Indian law
                    and in an Indian court. The specific jurisdiction will be in
                    Karaikudi, Tamil Nadu, where our business is registered or
                    operated.
                    {'\n\n'}
                    You agree that in case of a dispute, you will cooperate with
                    us in legal processes and not file complaints in foreign
                    courts or under other legal systems. This section ensures
                    fairness, legal clarity, and proper conflict resolution. You
                    also agree that any claims must be made within a reasonable
                    time. If you have legal concerns, we suggest discussing them
                    with a qualified legal advisor.
                  </Text>
                  {'\n\n'}
                  <Text className="font-semibold mt-4">
                    By using our platform, you acknowledge that you have read,
                    understood, and agree to be bound by these Terms and
                    Conditions.
                  </Text>
                </Text>
              </ScrollView>
              <TouchableOpacity
                onPress={() => setShowTerms(false)}
                className="bg-orange-500 rounded-md py-3"
              >
                <Text className="text-center text-white font-semibold">
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View className="flex-row justify-between mb-6">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-gray-300 px-6 py-3 rounded-lg"
          >
            <Text className="text-gray-600 font-semibold">Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!password || !confirmPassword || !agreed}
            className={`px-6 py-3 rounded-lg ${!password || !confirmPassword || !agreed ? 'bg-orange-300' : 'bg-orange-500'}`}
          >
            <Text className="text-white font-semibold">Register</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate(('Login'), { type: 'business' })}>
          <Text className="text-sm text-orange-600 text-center">
            Already have an account?
            <Text className="underline"
              onPress={() => navigation.navigate('Login', { type })}
            >Login</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default BusinessStep3;
