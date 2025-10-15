// src/routes.js
import Home from './pages/home/Home.jsx';
import Users from './pages/users/Users.jsx';
import Settings from './pages/settings/Settings.jsx';

export const routes = [
  { path: '/', component: Home },
  { path: '/users', component: Users },
  { path: '/settings', component: Settings },
];