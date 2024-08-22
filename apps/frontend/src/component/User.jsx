import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

const User = () => {
  return (
    <div className="wrapper">
      <Sidebar />

      <div className="main-panel">
        <Header />

        <div className="container">
          <div className="page-inner">
            <div className="page-header">
              <h3 className="fw-bold mb-3">사용자 관리</h3>
            </div>
            <div className="row">
              <div className="col-md-3">
                <div className="card card-profile">
                  <div className="card-body">
                    <div className="user-profile text-center">
                      <div className="name">사용자 이름</div>
                      <div className="job">user_id</div>
                      <div className="desc">2024-08-22</div>
                      <div className="view-profile">
                        <a
                          href="#"
                          className="btn btn-primary btn-border btn-round"
                        >
                          자세히보기
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="row user-stats text-center">
                      <div className="col">
                        <div className="number">온라인 여부</div>
                        <div className="title">🟢</div>
                      </div>
                      <div className="col">
                        <div className="number">로그 내역</div>
                        <div className="title">12</div>
                      </div>
                      <div className="col">
                        <div className="number">수리 내역</div>
                        <div className="title">03</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card card-profile">
                  <div className="card-body">
                    <div className="user-profile text-center">
                      <div className="name">사용자 이름</div>
                      <div className="job">user_id</div>
                      <div className="desc">2024-08-22</div>
                      <div className="view-profile">
                        <a
                          href="#"
                          className="btn btn-primary btn-border btn-round"
                        >
                          자세히보기
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="row user-stats text-center">
                      <div className="col">
                        <div className="number">온라인 여부</div>
                        <div className="title">⚫</div>
                      </div>
                      <div className="col">
                        <div className="number">로그 내역</div>
                        <div className="title">12</div>
                      </div>
                      <div className="col">
                        <div className="number">수리 내역</div>
                        <div className="title">03</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card card-profile">
                  <div className="card-body">
                    <div className="user-profile text-center">
                      <div className="name">사용자 이름</div>
                      <div className="job">user_id</div>
                      <div className="desc">2024-08-22</div>
                      <div className="view-profile">
                        <a
                          href="#"
                          className="btn btn-primary btn-border btn-round"
                        >
                          자세히보기
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="row user-stats text-center">
                      <div className="col">
                        <div className="number">온라인 여부</div>
                        <div className="title">⚫</div>
                      </div>
                      <div className="col">
                        <div className="number">로그 내역</div>
                        <div className="title">12</div>
                      </div>
                      <div className="col">
                        <div className="number">수리 내역</div>
                        <div className="title">03</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card card-profile">
                  <div className="card-body">
                    <div className="user-profile text-center">
                      <div className="name">사용자 이름</div>
                      <div className="job">user_id</div>
                      <div className="desc">2024-08-22</div>
                      <div className="view-profile">
                        <a
                          href="#"
                          className="btn btn-primary btn-border btn-round"
                        >
                          자세히보기
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="row user-stats text-center">
                      <div className="col">
                        <div className="number">온라인 여부</div>
                        <div className="title">⚫</div>
                      </div>
                      <div className="col">
                        <div className="number">로그 내역</div>
                        <div className="title">12</div>
                      </div>
                      <div className="col">
                        <div className="number">수리 내역</div>
                        <div className="title">03</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card card-profile">
                  <div className="card-body">
                    <div className="user-profile text-center">
                      <div className="name">사용자 이름</div>
                      <div className="job">user_id</div>
                      <div className="desc">2024-08-22</div>
                      <div className="view-profile">
                        <a
                          href="#"
                          className="btn btn-primary btn-border btn-round"
                        >
                          자세히보기
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="row user-stats text-center">
                      <div className="col">
                        <div className="number">온라인 여부</div>
                        <div className="title">⚫</div>
                      </div>
                      <div className="col">
                        <div className="number">로그 내역</div>
                        <div className="title">12</div>
                      </div>
                      <div className="col">
                        <div className="number">수리 내역</div>
                        <div className="title">03</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default User;
