import pandas as pd
from sqlalchemy import create_engine
import logging

# DB 연결 문자열 설정
DB_URL = 'mysql+pymysql://qrancae:1234@project-db-cgi.smhrd.com:3307/qrancae'

class DataManager:
    def __init__(self):
        self.data = None

    def load_data_from_db(self):
        """DB에서 데이터를 로드합니다."""
        logging.info("Loading data from database...")
        try:
            engine = create_engine(DB_URL)
            query = """
            SELECT cable_idx, maint_qr, maint_cable, maint_power, maint_update, maint_advice
            FROM tb_maintenance
            WHERE maint_advice = '비추천'
            """
            with engine.connect() as connection:
                self.data = pd.read_sql(query, connection)
            logging.info(f"Data loaded successfully: {self.data.shape[0]} rows.")
        except Exception as e:
            logging.error(f"Error loading data from database: {e}")
            raise
        finally:
            engine.dispose() # 연결을 명시적으로 해제합니다. 

# 127.0.0.1 - - [03/Sep/2024 15:25:10] "GET /runMaintenanceAdvisor HTTP/1.1" 500 -   
# INFO:werkzeug:127.0.0.1 - - [03/Sep/2024 15:25:10] "GET /runMaintenanceAdvisor HTTP/1.1" 500 -
# ERROR:root:Error loading data from database: (pymysql.err.OperationalError) (1040, 'Too many connections')
# (Background on this error at: https://sqlalche.me/e/20/e3q8)
# Error: (pymysql.err.OperationalError) (1040, 'Too many connections')
# (Background on this error at: https://sqlalche.me/e/20/e3q8)

    def preprocess_data(self):
        """필요한 전처리 작업을 수행합니다."""
        logging.info("Preprocessing data...")
        try:
            self.data['maint_qr'] = self.data['maint_qr'].apply(lambda x: 1 if x == '불량' else 0)
            self.data['maint_cable'] = self.data['maint_cable'].apply(lambda x: 1 if x == '불량' else 0)
            self.data['maint_power'] = self.data['maint_power'].apply(lambda x: 1 if x == '불량' else 0)
            self.data['maint_update'] = pd.to_datetime(self.data['maint_update'])
            
            # 현재 날짜로부터 3개월 이전 날짜 계산
            three_months_ago = pd.Timestamp.now() - pd.DateOffset(months=3)
            
            self.data['recommend'] = self.data.apply(lambda row: (
                (pd.isnull(row['maint_update']) and (row['maint_qr'] == 1 or row['maint_cable'] == 1 or row['maint_power'] == 1)) or
                (row['maint_update'] is not pd.NaT and row['maint_update'] < three_months_ago and 
                 (row['maint_qr'] == 1 or row['maint_cable'] == 1 or row['maint_power'] == 1))
            ), axis=1)
            
            logging.info("Data preprocessed successfully.")
        except Exception as e:
            logging.error(f"Error during data preprocessing: {e}")
            raise

    def get_recommendations(self):
        """점검 추천 데이터를 반환합니다."""
        recommendations = self.data[self.data['recommend'] == True][['cable_idx']]
        return recommendations
