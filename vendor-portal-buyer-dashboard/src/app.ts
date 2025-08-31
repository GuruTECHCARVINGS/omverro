import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import BuyerDashboard from './pages/buyerDashboard';
import './styles/tailwind.css';
import './styles/globals.css';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" component={BuyerDashboard} />
      </Switch>
    </Router>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));