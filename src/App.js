import { ProvideAppContext } from './context/AppContext'
import { Route } from 'wouter'
import Header from './components/Header';
import Footer from "./components/Footer";
import DeployBlog from './pages/DeployBlog';

const Main = () => {
    return (
        <main>
            <Header />
                <Route path='/blog'>
                    <DeployBlog/>
                </Route>
            <Footer />
        </main>
    )
}

export default App = () => <ProvideAppContext><Main/></ProvideAppContext>