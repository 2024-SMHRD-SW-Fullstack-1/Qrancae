import pandas as pd
from sqlalchemy import create_engine, text
import pickle
import logging

# 로그 설정
logging.basicConfig(filename='maintenance_advisor.log', level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# DB 연결 문자열
DB_URL = 'mysql+pymysql://qrancae:1234@project-db-cgi.smhrd.com:3307/qrancae'

# MySQL에서 데이터 불러오기
def load_data_from_db():
    logging.info("Loading data from database...")
    try:
        engine = create_engine(DB_URL)
        query = """
        SELECT maint_idx, cable_idx, maint_qr, maint_cable, maint_power
        FROM tb_maintenance
        WHERE maint_advice = '비추천'
        """
        with engine.connect() as connection:
            data = pd.read_sql(query, connection)
        logging.info(f"Data loaded successfully: {data.shape[0]} rows.")
        return data
    except Exception as e:
        logging.error(f"Error loading data from database: {e}")
        raise

# 머신러닝 모델 불러오기
def load_model(model_path):
    logging.info("Loading machine learning model...")
    try:
        with open(model_path, 'rb') as file:
            model = pickle.load(file)
        logging.info("Model loaded successfully.")
        return model
    except Exception as e:
        logging.error(f"Error loading model: {e}")
        raise

# 예측 수행
def make_predictions(model, data):
    logging.info("Making predictions...")
    try:
        # 문자열 데이터를 수치형으로 변환
        data['maint_qr'] = data['maint_qr'].apply(lambda x: 1 if x == '불량' else 0)
        data['maint_cable'] = data['maint_cable'].apply(lambda x: 1 if x == '불량' else 0)
        data['maint_power'] = data['maint_power'].apply(lambda x: 1 if x == '불량' else 0)

        X = data[['maint_qr', 'maint_cable', 'maint_power']]
        predictions = model.predict(X)
        recommendations = {row['cable_idx']: '추천' if pred == 1 else '비추천' 
                           for row, pred in zip(data.to_dict('records'), predictions)}
        logging.info("Predictions made successfully.")
        return recommendations
    except Exception as e:
        logging.error(f"Error making predictions: {e}")
        raise

# DB 업데이트
def update_db_with_recommendations(recommendations):
    logging.info("Updating database with recommendations...")
    try:
        engine = create_engine(DB_URL)
        with engine.connect() as connection:
            for cable_idx, advice in recommendations.items():
                query = text("""
                    UPDATE tb_maintenance
                    SET maint_advice = :advice
                    WHERE cable_idx = :cable_idx AND maint_advice = '비추천'
                """)
                connection.execute(query, {"advice": advice, "cable_idx": cable_idx})
        logging.info("Database updated successfully.")
    except Exception as e:
        logging.error(f"Error updating database: {e}")
        raise

def main():
    logging.info("Starting maintenance advisor process.")
    try:
        # 머신러닝 모델 불러오기
        model = load_model('ai_model/model.pkl')

        # MySQL에서 데이터 가져오기
        data = load_data_from_db()

        # 예측 수행 및 결과 업데이트
        recommendations = make_predictions(model, data)
        update_db_with_recommendations(recommendations)

        logging.info("Maintenance advisor process completed successfully.")
    except Exception as e:
        logging.error(f"Process failed: {e}")

if __name__ == "__main__":
    main()