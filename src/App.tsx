import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './App.css'
import Header from './Header';
import Users from './Users';

export default function App() {  
  return (
  <div id="center">
    <ToastContainer/>
    <Header title="User Dashboard"/>      	
    <Users/>      
  </div>  
  );	
}