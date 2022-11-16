import axios from 'axios';
import { useAppContext } from '../../context/AppContext';
import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Carousel from 'react-bootstrap/Carousel';
import FormControl from 'react-bootstrap/FormControl';
import image1 from '../../assets/blog-images/blogsoftware-1.png';
import image2 from '../../assets/blog-images/blogsoftware-2.png';
import image3 from '../../assets/blog-images/blogsoftware-3.png';
import image4 from '../../assets/blog-images/blogsoftware-4.png';
import image5 from '../../assets/blog-images/blogsoftware-5.png';
import image6 from '../../assets/blog-images/blogsoftware-6.png';
import './DeployBlog.css';
import { ethers } from 'ethers';
import blogabi from "../../assets/blogabi.json";
import blogbytecode from "../../assets/blogbytecode.json";

// TODO: do something better than hard-coding
const VERSION = '0.1';
const ROOT_DIR_ID =
    '344d8fd941a1b827244cfa2ba10950a1ea2b0639b456236f87a5d17765014fc3	'
const ROUTES_FILE_ID =
    '8f0764496bfaa6dfcca4ce74f1cacc32b5f7798dfe7db9654182c5c1860a2272'
const CONTRACT_ABI_ID = 
    'f971a0c90624351ee5beb6c28fea24f18e436de8ecd282069b64d4cbea289384'

const BLOG_IMAGES = [
    { caption: 'Create blog posts', img: image1 },
    { caption: 'Share on your wall', img: image2 },
    { caption: 'Blog post preview - 1', img: image3 },
    { caption: 'Blog post preview - 2', img: image4 },
    { caption: 'Admin Panel', img: image6 },
    { caption: 'Customization', img: image5 },
];

const DeployBlog = () => {
    const { walletIdentity } = useAppContext();
    const [subhandle, setSubhandle] = useState('blog');
    const [loading, setLoading] = useState(null);
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);

    const [activeSlideIndex, setActiveSlideIndex] = useState(0);

    const deploy = async (subidentity) => {
        try {
            // 1. checking if subidentity is already registered
            setLoading('Checking subidentity...');

            const {data: identityRegistered}  = await window.point.contract.call({
                contract: 'Identity',
                method: 'lowercaseToCanonicalIdentities',
                params: [`${subidentity}.${walletIdentity.toLowerCase()}`],
            });

            console.log('subidentity:', identityRegistered);

            if (identityRegistered) {
                // checking if there's a website already on this identity
                const {data: ikvset} = await window.point.contract.call({contract: 'Identity', method: 'getIkvList', params: [`${subidentity}.${walletIdentity.toLowerCase()}`]});
                if (ikvset) {
                    if (ikvset.find((el) => el[1] === 'zdns/routes')) {
                        setError(
                            'A website is already deployed on this address. Please, choose another subidentity',
                        );
                        setLoading(null);
                        return;
                    }
                }
            } else {
                // deploy subidentity
                setLoading('Registering subidentity...');

                const { data } = await window.point.identity.me();
                const { identity, address, publicKey } = data;
                const commPublicKeyPart1 = `0x${publicKey.slice(0, 64).toString('hex')}`;
                const commPublicKeyPart2 = `0x${publicKey.slice(64).toString('hex')}`;

                await window.point.contract.call({
                    contract: 'Identity',
                    method: 'registerSubidentity',
                    params: [subidentity, identity, address, commPublicKeyPart1, commPublicKeyPart2],
                });
            }

            // 2. Download contract
            // setLoading('Downloading blog contract bytecode...');
            // const bytecodeBlob = await window.point.storage.getFile({id: CONTRACT_BYTECODE_ID});
            // const bytecode = await bytecodeBlob.text();
            // abi = JSON.parse(fs.readFileSync('storage.abi').toString());

            // 3. Deploy contract
            setLoading('Deploying blog contract...');

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer0 = provider.getSigner(0);
            // const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

            console.log('provider: ', provider);
            // console.log('accounts: ', accounts);
            console.log('bytecode: ', blogbytecode.bytecode);
            console.log('abi: ', blogabi);

            // const account = ethers.wallet.connect(provider);
            const blogContract = new ethers.ContractFactory(blogabi, blogbytecode.bytecode, signer0);
            const contract = await blogContract.deploy();
            await contract.deployed();
            
            console.log('contract.address: ' + contract.address);
            console.log('contract.deployTransaction: ' + contract.deployTransaction);

            // 5. update IKV zdns
            setLoading('Updating IKV contract address...');
            
            await window.point.contract.call({
                contract: 'Identity',
                method: 'ikvPut',
                params: [`${subidentity}.${walletIdentity.toLowerCase()}`, 'zweb/contracts/address/Blog', contract.address, VERSION],
            });

            // 4. update IKV rootDir
            setLoading('Updating IKV rootDir...');

            await window.point.contract.call({
                contract: 'Identity',
                method: 'ikvPut',
                params: [`${subidentity}.${walletIdentity.toLowerCase()}`, '::rootDir', ROOT_DIR_ID, VERSION],
            });

            // 5. update IKV zdns
            setLoading('Updating IKV zdns...');
            
            await window.point.contract.call({
                contract: 'Identity',
                method: 'ikvPut',
                params: [`${subidentity}.${walletIdentity.toLowerCase()}`, 'zdns/routes', ROUTES_FILE_ID, VERSION],
            });

            // 5. update abi id
            setLoading('Updating abi id...');

            await window.point.contract.call({
                contract: 'Identity',
                method: 'ikvPut',
                params: [`${subidentity}.${walletIdentity.toLowerCase()}`, 'zweb/contracts/abi/Blog', CONTRACT_ABI_ID, VERSION],
            });

            setLoading(null);
            setSuccess(true);
            setError(null);
        } catch (e) {
            setLoading(null);
            setError(e.message);
        }
    };

    return (
        <div className="deploy-container p-5">
            {success ? (
                <Alert variant="success">
                    <Alert.Heading>Deployment Successful!</Alert.Heading>
                    <p>
                        Blog is available at:{' '}
                        <Alert.Link
                            href={`https://${subhandle}.${walletIdentity}.point`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {`https://${subhandle}.${walletIdentity}.point`}
                        </Alert.Link>
                        . You can now visit your domain and start writing blog
                        posts. (But it may take a while for it to be available)
                    </p>
                </Alert>
            ) : error ? (
                <Alert variant="danger">
                    <Alert.Heading>Deployment Failed!</Alert.Heading>
                    <p>
                        {typeof error === 'string' ? (
                            error
                        ) : (
                            <>
                                Failed to deploy blog at:
                                {` https://${subhandle}.${walletIdentity}.point. `}
                                Please try again.
                            </>
                        )}
                    </p>
                </Alert>
            ) : null}
            <Row>
                <Col xs={5}>
                    <h1 className="mt-2 mb-2 ">
                        Share your ideas over your own domain, uncensored.
                    </h1>
                    <h4>Launch your own blogging site!</h4>
                    <p className="mt-4 mb-0 text-secondary">
                        Enter the subdomain below where you want your blog to be
                        deployed.
                    </p>
                    <p className="mt-0 text-secondary">
                        A great option is &quot;blog.{walletIdentity}
                        .point&quot;, but you can pick any name you want.
                    </p>
                    <Row className="align-items-center mb-3">
                        <Col style={{ paddingRight: 0 }}>
                            <FormControl
                                value={subhandle}
                                type="text"
                                placeholder="blog"
                                defaultValue="blog"
                                onChange={(e) => {
                                    setSuccess(false);
                                    setSubhandle(e.target.value);
                                }}
                            />
                        </Col>
                        <Col>.{walletIdentity}.point</Col>
                    </Row>
                    <p className="mt-0 text-secondary">{loading}</p>
                    <Button
                        variant="primary"
                        onClick={() => {
                            deploy(subhandle.toLowerCase());
                        }}
                        disabled={Boolean(loading) || success || !subhandle}
                    >
                        {loading ? 'Deploying...' : 'Deploy'}
                    </Button>
                </Col>
                <Col xs={1}></Col>
                <Col
                    xs={6}
                    className="position-relative d-flex flex-column align-items-center justify-content-center"
                >
                    <h4 className="mb-3 text-white">
                        {BLOG_IMAGES[activeSlideIndex].caption}
                    </h4>
                    <Carousel
                        interval={2000}
                        className="shadow-lg"
                        indicators={false}
                        pause={false}
                        onSlide={setActiveSlideIndex}
                    >
                        {BLOG_IMAGES.map((item) => (
                            <Carousel.Item key={item.caption}>
                                <Image
                                    src={item.img}
                                    fluid
                                    rounded
                                    className="border"
                                />
                            </Carousel.Item>
                        ))}
                    </Carousel>
                    <div className="bg-primary rounded clipped-bg position-absolute top-0"></div>
                </Col>
            </Row>
        </div>
    );
};

export default DeployBlog;
