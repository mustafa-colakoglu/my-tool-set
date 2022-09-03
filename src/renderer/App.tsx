/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  MemoryRouter as Router,
  Routes,
  Route,
  NavLink,
} from 'react-router-dom';
import {
  Card,
  CardBody,
  Col,
  Nav,
  NavItem,
  TabContent,
  Table,
  TabPane,
} from 'reactstrap';
import { useCallback, useEffect, useState } from 'react';
import 'bootstrap/scss/bootstrap.scss';
import { AdressInterface } from '../interfaces';
// import './App.global.css';

const Hello = () => {
  const [addresses, setAddresses] = useState<AdressInterface[]>([]);
  const [connection, setConnection] = useState(false);
  const [error, setError] = useState('');
  const updater = useCallback(() => {
    window.electron.ipcRenderer.sendMessage(
      'get-connection-and-ip-adresses',
      []
    );
    setTimeout(() => updater(), 1000);
  }, []);
  useEffect(() => {
    window.electron.ipcRenderer.on(
      'get-connection-and-ip-adresses',
      (args: any) => {
        setConnection(args.connection);
        setAddresses(args.addresses);
        setError(args.error);
      }
    );
    updater();
  }, [updater]);
  // State for current active Tab
  const [currentActiveTab, setCurrentActiveTab] = useState('1');

  // Toggle active state for Tab
  const toggle = (tab: string) => {
    if (currentActiveTab !== tab) setCurrentActiveTab(tab);
  };
  return (
    <Col style={{ fontSize: '14px' }}>
      {error && error}
      <Nav pills>
        <NavItem
          active={currentActiveTab === '1'}
          onClick={() => {
            toggle('1');
          }}
        >
          <NavLink to="#">General</NavLink>
        </NavItem>
        <NavItem
          active={currentActiveTab === '2'}
          onClick={() => {
            toggle('2');
          }}
        >
          <NavLink to="#">Ports</NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={currentActiveTab}>
        <TabPane tabId="1">
          <Table>
            <thead>
              <tr>
                <td>Interface</td>
                <td>Ip</td>
              </tr>
            </thead>
            <tbody>
              {addresses.map((item) => (
                <tr key={item.name}>
                  <td>{item.name}</td>
                  <td>{item.address}</td>
                </tr>
              ))}
              <tr>
                <td>Connection</td>
                <td>
                  <span style={{ color: connection ? 'green' : 'red' }}>
                    {connection ? 'Connected' : 'Not connected'}
                  </span>
                </td>
              </tr>
            </tbody>
          </Table>
        </TabPane>
        <TabPane tabId="2">Soon</TabPane>
      </TabContent>
      <Card>
        <CardBody color="success">test</CardBody>
      </Card>
    </Col>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
