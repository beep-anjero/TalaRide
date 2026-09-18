import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Brand, Button, Copy, Field, Icon, IconButton, Title, replace, s } from '@/components/ui';
import { Notice } from '@/components/Notice';
import { colors } from '@/constants/theme';
import { useMock } from '@/mocks/MockProvider';

export default function SignInScreen() {
  const { startSampleSession } = useMock();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  function signIn() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || !password.trim()) {
      setError('Enter a valid email address and a password.');
      return;
    }
    // UI-only session: no credentials are transmitted or retained.
    startSampleSession();
    replace('/home');
  }
  return (
    <Screen>
      <View style={{ alignItems: 'center', paddingVertical: 30 }}>
        <Brand large />
      </View>
      <Title style={{ textAlign: 'center', fontSize: 22 }}>Welcome back!</Title>
      <Copy style={{ textAlign: 'center', color: colors.muted, marginTop: 4, marginBottom: 24 }}>
        Sign in to access your account.
      </Copy>
      <View style={{ gap: 10 }}>
        <Field
          label="Email address"
          placeholder="Email address"
          icon="mail-outline"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <Field
          label="Password"
          placeholder="Password"
          icon="lock-closed-outline"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoComplete="off"
          trailing={
            <IconButton
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              label={showPassword ? 'Hide password' : 'Show password'}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
        />
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => setNotice('Password recovery')}
        style={{ alignSelf: 'flex-end', paddingVertical: 12 }}
      >
        <Copy style={{ fontSize: 13, color: colors.darkGreen }}>Forgot password?</Copy>
      </Pressable>
      {!!error && (
        <Copy accessibilityRole="alert" style={{ color: colors.red, marginBottom: 10 }}>
          {error}
        </Copy>
      )}
      <Button label="Sign In" onPress={signIn} />
      <View style={[s.row, { marginVertical: 20 }]}>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        <Copy style={{ fontSize: 13 }}>or continue with</Copy>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      </View>
      <View style={{ gap: 10 }}>
        {(['Google', 'Apple'] as const).map((provider) => (
          <Pressable
            key={provider}
            accessibilityRole="button"
            onPress={() => setNotice(`Continue with ${provider}`)}
            style={[
              s.row,
              {
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 10,
                minHeight: 48,
              },
            ]}
          >
            {provider === 'Google' ? (
              <Copy bold style={{ fontSize: 24, color: '#4285F4' }}>
                G
              </Copy>
            ) : (
              <Icon name="logo-apple" size={25} />
            )}
            <Copy bold>Continue with {provider}</Copy>
          </Pressable>
        ))}
      </View>
      <View style={[s.row, { justifyContent: 'center', flexWrap: 'wrap', gap: 4, marginTop: 24 }]}>
        <Copy>Don’t have an account?</Copy>
        <Pressable accessibilityRole="button" onPress={() => setNotice('Sign Up')}>
          <Copy bold style={{ color: colors.darkGreen }}>
            Sign Up
          </Copy>
        </Pressable>
      </View>
      {!!notice && (
        <Notice
          title={notice}
          message="Account services will be available when authentication is connected. You can explore TalaRide with the sample profile now."
          onClose={() => setNotice('')}
        >
          <Button
            label="Explore sample profile"
            onPress={() => {
              startSampleSession();
              replace('/home');
            }}
          />
        </Notice>
      )}
    </Screen>
  );
}
