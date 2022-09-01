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
import { Col, Nav, NavItem, TabContent, Table, TabPane } from 'reactstrap';
import { useCallback, useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

interface AdressInterface {
  name: string;
  address: string;
}
const Hello = () => {
  const [addresses, setAddresses] = useState<AdressInterface[]>([]);
  const [connection, setConnection] = useState(false);
  const updater = useCallback(() => {
    console.log('aaa');
    window.electron.ipcRenderer.sendMessage('get-connection-and-adresses', []);
    setTimeout(() => updater(), 1500);
  }, []);
  useEffect(() => {
    window.electron.ipcRenderer.once(
      'get-connection-and-adresses',
      (args: any) => {
        console.log('bbb');
        setConnection(args.connections);
        setAddresses(args.addresses);
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
          active={currentActiveTab === '1'}
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
