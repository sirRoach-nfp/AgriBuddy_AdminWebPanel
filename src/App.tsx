import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Button from '@mui/material/Button';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';




import Adminlayout from './AdminLayout';
import ArticleManagement from './Screens/ArticleManagement/ArticleManagement';
import ReportedContent from './Screens/ReportedContent/ReportedContent';
import CropDatabase from './Screens/CropDatabase/CropDatabase';
import ArticleUpload from './Screens/ArticleManagement/ArticleUpload/ArticleUpload';
import ArticleEdit from './Screens/ArticleManagement/ArticleEdit/ArticleEdit';
import CropUpload from './Screens/CropDatabase/CropUpload/CropUpload';
import PestDatabase from './Screens/PestDatabase/PestDatabase';
import PestUpload from './Screens/PestDatabase/PestUpload/PestUpload';
import DiseaseDatabase from './Screens/DiseaseDatabase/DiseaseDatabase';
import DiseaseUpload from './Screens/DiseaseDatabase/DiseaesUpload/DiseaseUpload';
import PestEdit from './Screens/PestDatabase/PestEdit/PestEdit';
import DiseaseEdit from './Screens/DiseaseDatabase/DiseaseEdit/DiseaseEdit';
import CropUpdate from './Screens/CropDatabase/CropUpdate/CropUpdate';
import AuthenticationScreen from './Screens/AuthenticationScreen/AuthenticationScreen';
import ProtectedRoute from './Screens/ProtectedRoute';



function App() {
  const [count, setCount] = useState(0)

  return (

    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    
      <Router>
        <Routes>

          <Route path='/' element={<AuthenticationScreen/>}/>


          <Route path='/admin' element={
            
              <ProtectedRoute>


                <Adminlayout />
              </ProtectedRoute>
            
            
            
            
            } >
          
            <Route path='article_management' element={<ArticleManagement />}/>
            <Route path='article_upload' element={<ArticleUpload />}/>
            <Route path='article_Edit/:id' element={<ArticleEdit/>}/>
            <Route path='reported_content' element={<ReportedContent />}/>
            <Route path='crop_database' element={<CropDatabase />}/>
            <Route path='crop_upload' element={<CropUpload/>}/>
            <Route path='crop_edit/:id' element={<CropUpdate/>}/>
            <Route path='pest_database' element={<PestDatabase/>}/>
            <Route path='pest_upload' element={<PestUpload />}/>
            <Route path='pest_edit/:id' element={<PestEdit/>}/>
            <Route path='disease_database' element={<DiseaseDatabase/>}/>
            <Route path='disease_upload' element={<DiseaseUpload/>}/>
            <Route path='disease_edit/:id' element={<DiseaseEdit/>}/>
          </Route>

        </Routes>
      </Router>    
    
    </>

  )
}

export default App
