import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';


const Home = () => {
  return (
    <div className="App">
      <div className="wrapper">
        <Sidebar />

        <div className="main-panel">
          <Header />

          <div className="container">
            <div className="page-inner">
              <div className="row">
                <div className="col-md-4 d-flex flex-column">
                  <div className="card card-round flex-grow-1">
                    <div className="card-header">
                      <div className="card-head-row">
                        <div className="card-title">케이블 위치 확인</div>
                      </div>
                    </div>
                    <div className="card-body" style={{ height: '100%', overflowY: 'auto' }}>
                    </div>
                  </div>
                </div>
                <div className="col-md-8 d-flex flex-column">
                  <div className="card card-round flex-grow-1 mb-2">
                    <div className="card-header">
                      <div className="card-head-row">
                        <div className="card-title">점검 대상 케이블</div>
                      </div>
                    </div>
                    <div className="card-body" style={{ height: '50%', overflowY: 'auto' }}>
                    </div>
                  </div>
                  <div className="card card-round flex-grow-1 mb-2">
                    <div className="card-header">
                      <div className="card-head-row">
                        <div className="card-title">점검 중인 케이블</div>
                      </div>
                    </div>
                    <div className="card-body" style={{ height: '50%', overflowY: 'auto' }}>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Home;
