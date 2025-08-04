import React from 'react';
import { View } from 'react-native';
import Header from './Header';
import Bottom from './Bottom';

const Layout = ({ children, showHeader = true, showBottom = true }) => {
  console.log('Layout rendered');
  return (
    <View style={{ flex: 1 }}>
      {showHeader && <Header />}
      <View className="flex-1">{children}</View>
      {showBottom && <Bottom />}
    </View>
  );
};

export default Layout;
