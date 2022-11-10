import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Popover from 'react-bootstrap/Popover'
import Button from 'react-bootstrap/Button'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import { Link } from "wouter";
import { useAppContext } from '../context/AppContext';
import Wallet from '../components/Wallet';
import { useState, useEffect } from "react";

export default function Home() {
  const { walletAddress } = useAppContext();
  const [currentPointNodeVersion, setCurrentPointNodeVersion] = useState('');
  const [requiredPointNodeVersion, setRequiredPointNodeVersion] = useState('');
  const [requiredPointSDKVersion, setRequiredPointSDKVersion] = useState('');

  const popover = (
    <Popover id="popover-basic">
      <Popover.Header as="h3">Popover right</Popover.Header>
      <Popover.Body>
        And here's some <strong>amazing</strong> content. It's very engaging.
        right?
      </Popover.Body>
    </Popover>
  );

  const fetchVersions = async () => {
    let pointNodeVersion = (await (await fetch('/v1/api/status/meta')).json()).data.pointNodeVersion;
    setCurrentPointNodeVersion(pointNodeVersion);

    const ikvsetFetched = await window.point.contract.events({
      host: '@',
      contract: 'Identity',
      event: 'IKVSet',
      filter: {'identity': 'template'}
    });
    if (ikvsetFetched.data != '') {
        let events = ikvsetFetched.data.reverse();
        let requiredSdkVersion = '';
        let requiredNodeVersion = '';
        for (const e of events){
          if(requiredSdkVersion === '' && e.data.key === 'zweb/point/sdk/version'){
            requiredSdkVersion = e.data.value;
          }
          if(requiredNodeVersion === '' && e.data.key === 'zweb/point/node/version'){
            requiredNodeVersion = e.data.value;
          }
        }
        setRequiredPointNodeVersion(requiredNodeVersion);
        setRequiredPointSDKVersion(requiredSdkVersion);
    }
};

  let currentVersionSDK = window.point.version;
  
  useEffect(() => {
    fetchVersions();
  }, []);


  return (
    <>
      <Container className="p-3">
        <h1 className="header">Welcome to the Point Network Template App!</h1>
        <Wallet walletAddress={walletAddress} />
        <p>Current version of Point SDK: {currentVersionSDK}. Required version of Point SDK: {requiredPointSDKVersion}.</p>
        <p>Current version of Point Node: {currentPointNodeVersion}. Required version of Point Node: {requiredPointNodeVersion}.</p>
        <Row>
          <Col>
            <h4>Deploy Blog</h4>
            <Link to='/blog'><Button variant="primary" size="sm">Deploy a Blog dApp</Button></Link><br/>
            Deploy a Blog dApp!<br/><br/>
          </Col>
        </Row>
      </Container>
    </>
  );
}
