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
import { LocalConvenienceStoreOutlined } from '@material-ui/icons';

// TODO: do something better than hard-coding
const VERSION = '0.1';
const ROOT_DIR_ID =
    '29bf6bf64079ea189e92433ece0baa29ee686040f8a7643c421c7826422547c9'
    //'a867d811b3927289b4e66e219baaac4d14078275d4b7c9181690115a6a03c34e';
    // '6ce5c3f525128f4173cd4931870b28d05280d66bd206826be1f23242d05c94bb';
const ROUTES_FILE_ID =
    '8f0764496bfaa6dfcca4ce74f1cacc32b5f7798dfe7db9654182c5c1860a2272'
    //'8f0764496bfaa6dfcca4ce74f1cacc32b5f7798dfe7db9654182c5c1860a2272';
    // '5f38f36718c426e74ded142347ecc4310e8eb4755c31ce06bcecd26cdbfe7b41';
const CONTRACT_SOURCE_ID =
    '042a2609875d2f5b628896adfc3affec2fd8aaf104f8824918cd94086872dc66';

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
            const ikvEntries = await window.point.identity.ikvList({identity: `${subidentity}.${walletIdentity.toLowerCase()}`})
            console.log(`ikvEntries.length: ${ikvEntries.length}`);
            if (ikvEntries.length>0) {
                // checking if there's a website already on this identity
                const ikvset = await window.point.identity.ikvList({identity: `${subidentity}.${walletIdentity.toLowerCase()}`})
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
                const commPublicKeyPart1 = `0x${publicKey.slice(0, 32).toString('hex')}`;
                const commPublicKeyPart2 = `0x${publicKey.slice(32).toString('hex')}`;

                console.log(`identity: ${identity}, address: ${address}, commPublicKeyPart1: ${commPublicKeyPart1}, commPublicKeyPart2: ${commPublicKeyPart2}`)
            }

            // 2. Download contract
            setLoading('Downloading blog contract...');
            const blob = await window.point.storage.getFile({id: CONTRACT_SOURCE_ID});
            console.log(`Contract Data ******* ${await blob.text()}`);

            // // 3. Deploy contract
            // setLoading('Deploying blog contract...');
            // const formData = new FormData();
            // formData.append('contractNames', '["Blog"]');
            // formData.append('version', VERSION);
            // formData.append(
            //     'target',
            //     `${subidentity}.${walletIdentity.toLowerCase()}`,
            // );
            // formData.append(
            //     'dependencies',
            //     '["@openzeppelin/contracts", "@openzeppelin/contracts-upgradeable"]',
            // );
            // formData.append(
            //     'files',
            //     new Blob([contractFile], { type: 'text/plain' }),
            // );
            // await axios.post(
            //     '/point_api/deploy_upgradable_contracts',
            //     formData,
            //     // {
            //     //     headers: {
            //     //         'X-Point-Token': `Bearer ${await window.point.point.get_auth_token()}`,
            //     //     },
            //     // },
            // );

            // // 4. update IKV rootDir
            // setLoading('Updating IKV...');
            // await axios.post(
            //     '/v1/api/identity/ikvPut',
            //     {
            //         identity: `${subidentity}.${walletIdentity.toLowerCase()}`,
            //         key: '::rootDir',
            //         value: ROOT_DIR_ID,
            //         _csrf: window.localStorage.getItem('csrf_token'),
            //     },
            //     // {
            //     //     headers: {
            //     //         'X-Point-Token': `Bearer ${await window.point.point.get_auth_token()}`,
            //     //     },
            //     // },
            // );
            // // 5. update IKV zdns
            // await axios.post(
            //     '/v1/api/identity/ikvPut',
            //     {
            //         identity: `${subidentity}.${walletIdentity.toLowerCase()}`,
            //         key: 'zdns/routes',
            //         value: ROUTES_FILE_ID,
            //         _csrf: window.localStorage.getItem('csrf_token'),
            //     },
            //     // {
            //     //     headers: {
            //     //         'X-Point-Token': `Bearer ${await window.point.point.get_auth_token()}`,
            //     //     },
            //     // },
            // );
            // setLoading(null);
            // setSuccess(true);
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
