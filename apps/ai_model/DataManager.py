import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy import text
from datetime import timedelta
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
            SELECT m.cable_idx, m.maint_qr, m.maint_cable, m.maint_power, m.maint_update, m.maint_advice,
                   m.maint_status, c.s_rack_number, c.s_rack_location, c.s_port_number
            FROM tb_maintenance m
            JOIN tb_cable c ON m.cable_idx = c.cable_idx
            WHERE m.maint_status = '보수완료' AND (m.maint_advice IS NULL OR m.maint_advice != '추천')
            """
            with engine.connect() as connection:
                self.data = pd.read_sql(query, connection)
            logging.info(f"Data loaded successfully: {self.data.shape[0]} rows.")
        except Exception as e:
            logging.error(f"Error loading data from database: {e}")
            raise
        finally:
            engine.dispose()

    def preprocess_data(self):
        """필요한 전처리 작업을 수행합니다."""
        logging.info("Preprocessing data...")
        try:
            # maint_qr, maint_cable, maint_power 상태를 이진 값으로 변환
            self.data['maint_qr'] = self.data['maint_qr'].apply(lambda x: 1 if x == '불량' else 0)
            self.data['maint_cable'] = self.data['maint_cable'].apply(lambda x: 1 if x == '불량' else 0)
            self.data['maint_power'] = self.data['maint_power'].apply(lambda x: 1 if x == '불량' else 0)
            self.data['maint_update'] = pd.to_datetime(self.data['maint_update'], errors='coerce')

            # 현재 날짜로부터 3개월 이전 날짜 계산
            three_months_ago = pd.Timestamp.now() - pd.DateOffset(months=3)
            print(f"현재 날짜: {pd.Timestamp.now()}")
            print(f"3개월 전: {three_months_ago}")

            # 전부 불량이어도 점검 추천에 뜨도록 수정
            self.data['recommend'] = self.data.apply(lambda row: (
                (row['maint_qr'] == 1 or row['maint_cable'] == 1 or row['maint_power'] == 1) and  # 세 가지 중 하나라도 불량이면 추천
                (pd.isnull(row['maint_update']) or row['maint_update'] < three_months_ago)         # 3개월 이상 지난 경우
            ), axis=1)

            print(f"전처리 후 데이터: {self.data[['cable_idx', 'maint_qr', 'maint_cable', 'maint_power', 'recommend']]}")
            logging.info("Data preprocessed successfully.")
        except Exception as e:
            logging.error(f"Error during data preprocessing: {e}")
            raise

    def get_recommendations(self):
        """점검 추천 데이터를 반환합니다."""
        recommendations = self.data[self.data['recommend'] == True]
        return recommendations

    def update_advice(self, cable_idx, advice):
        """
        특정 케이블의 maint_advice를 '추천'으로 업데이트합니다.
        """
        logging.info(f"Updating maint_advice for cable_idx {cable_idx} to {advice}")
        try:
            engine = create_engine(DB_URL)
            query = text("""
                UPDATE tb_maintenance
                SET maint_advice = :advice
                WHERE cable_idx = :cable_idx
            """)

            print(f"Executing query for cable_idx {cable_idx} with advice {advice}")  # 디버깅용 로그

            with engine.connect() as connection:
                result = connection.execute(query, {"advice": advice, "cable_idx": cable_idx})
                
                # 명시적으로 트랜잭션을 커밋
                connection.commit()

                # 업데이트된 행(rowcount)을 출력하여 쿼리가 실행되었는지 확인
                print(f"Query executed, {result.rowcount} rows updated")  # 업데이트된 행 수 출력
                if result.rowcount == 0:
                    print("No rows were updated. Check if the cable_idx exists.")
                
            print("Update successful.")
        
        except Exception as e:
            logging.error(f"Error updating maint_advice: {e}")  # 오류 메시지 출력
            raise
        finally:
            engine.dispose()
