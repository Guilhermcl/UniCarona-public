import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BuscarScreen from '../screens/BuscarScreen';
import OferecerScreen from '../screens/OferecerScreen';
import PerfilScreen from '../screens/PerfilScreen';
import ChatScreen from '../screens/ChatScreen';
import DetalheCaronaScreen from '../screens/DetalheCaronaScreen';
import TornarMotoristaScreen from '../screens/TornarMotoristaScreen';
import NovoVeiculoScreen from '../screens/NovoVeiculoScreen';
import { IconeBuscar, IconeOferecer, IconePerfil, IconeChat } from '../components/Icones';
import { cores } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BuscarStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: cores.primaria },
        headerTintColor: cores.branco,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen
        name="BuscarLista"
        component={BuscarScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DetalheCarona"
        component={DetalheCaronaScreen}
        options={{ title: 'Detalhes da carona' }}
      />
    </Stack.Navigator>
  );
}

const opcoesStack = {
  headerStyle: { backgroundColor: cores.primaria },
  headerTintColor: cores.branco,
  headerTitleStyle: { fontWeight: '700' },
};

function PerfilStack() {
  return (
    <Stack.Navigator screenOptions={opcoesStack}>
      <Stack.Screen name="PerfilInicio" component={PerfilScreen} options={{ title: 'Perfil' }} />
      <Stack.Screen
        name="TornarMotorista"
        component={TornarMotoristaScreen}
        options={{ title: 'Quero ser motorista' }}
      />
      <Stack.Screen name="NovoVeiculo" component={NovoVeiculoScreen} options={{ title: 'Novo veiculo' }} />
    </Stack.Navigator>
  );
}

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: cores.textoClaro,
        tabBarStyle: {
          backgroundColor: cores.branco,
          borderTopColor: cores.borda,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        headerStyle: { backgroundColor: cores.primaria },
        headerTintColor: cores.branco,
        headerTitleStyle: { fontWeight: '700', letterSpacing: 0.5 },
      }}
    >
      <Tab.Screen
        name="Buscar"
        component={BuscarStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <IconeBuscar cor={color} tamanho={size} />,
        }}
      />
      <Tab.Screen
        name="Oferecer"
        component={OferecerScreen}
        options={{
          tabBarIcon: ({ color, size }) => <IconeOferecer cor={color} tamanho={size} />,
        }}
      />
      <Tab.Screen
        name="Suporte"
        component={ChatScreen}
        options={{
          title: 'Assistente UniCarona',
          tabBarIcon: ({ color, size }) => <IconeChat cor={color} tamanho={size} />,
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <IconePerfil cor={color} tamanho={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
