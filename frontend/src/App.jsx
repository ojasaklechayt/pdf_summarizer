import './App.css'
import Header from './components/Header'
import Chat from './components/Chat';
import { DocumentProvider } from './context/DocumentProvider';
function App() {

  return (
    <DocumentProvider>
      <Header />
      <Chat />
    </DocumentProvider>
  )
}

export default App
