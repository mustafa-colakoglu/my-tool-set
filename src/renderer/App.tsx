/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import {
  Col,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  Table,
  TabPane,
} from 'reactstrap';
import { useCallback, useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AdressInterface, Channels } from '../interfaces';

const Hello = () => {
  const [addresses, setAddresses] = useState<AdressInterface[]>([]);
  const [connection, setConnection] = useState(false);
  const [error, setError] = useState('');
  const updater = useCallback(() => {
    window.electron.ipcRenderer.sendMessage(
      Channels.getConnectionAndIpAddresses,
      []
    );
    setTimeout(() => updater(), 1000);
  }, []);
  useEffect(() => {
    window.electron.ipcRenderer.on(
      Channels.getConnectionAndIpAddresses,
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
          onClick={() => {
            toggle('1');
          }}
          siz
        >
          <NavLink to="#" active={currentActiveTab === '1'}>
            General
          </NavLink>
        </NavItem>
        <NavItem
          onClick={() => {
            toggle('2');
          }}
        >
          <NavLink to="#" active={currentActiveTab === '2'}>
            Ports
          </NavLink>
        </NavItem>
        <NavItem
          onClick={() => {
            toggle('3');
          }}
        >
          <NavLink to="#" active={currentActiveTab === '3'}>
            Info
          </NavLink>
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
        <TabPane tabId="3">
          Developed By Mustafa Çolakoğlu <br />
          Github :{' '}
          <a
            href="https://github.com/mustafa-colakoglu"
            target="_blank"
            rel="noreferrer"
          >
            mustafa-colakoglu
          </a>
          <br />
          Give me a coffee : 1L5vbDXSZbnMgmqYHKfbQywM8NtaDfJBhu
        </TabPane>
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
