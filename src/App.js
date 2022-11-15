import { ProvideAppContext } from './context/AppContext'
import Header from './components/Header';
import Footer from "./components/Footer";
import DeployBlog from './pages/DeployBlog';

const Main = () => {
    return (
        <main>
            <Header />
                <DeployBlog/>
            <Footer />
        </main>
    )
}

export default App = () => <ProvideAppContext><Main/></ProvideAppContext>