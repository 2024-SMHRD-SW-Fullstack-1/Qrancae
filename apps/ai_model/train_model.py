import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import pickle
from sqlalchemy import create_engine
import os
import logging

# 로그 설정
logging.basicConfig(filename='train_model.log', level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def load_data_from_db():
    logging.info("Loading data from database...")
    try:
        # SQLAlchemy 엔진 생성
        db_url = os.getenv('DATABASE_URL', 'mysql+mysqlconnector://qrancae:1234@project-db-cgi.smhrd.com:3307/qrancae')
        engine = create_engine(db_url)

        # SQL 쿼리 실행하여 데이터 로드
        query = "SELECT cable_idx, maint_qr, maint_cable, maint_power, maint_update FROM tb_maintenance WHERE maint_update IS NOT NULL"
        df = pd.read_sql(query, con=engine)
        logging.info(f"Data loaded successfully: {df.shape[0]} rows.")
        return df
    except Exception as e:
        logging.error(f"Error loading data from database: {e}")
        raise

def preprocess_data(df):
    logging.info("Preprocessing data...")
    try:
        # 데이터 전처리
        df['maint_qr'] = df['maint_qr'].apply(lambda x: 1 if x == '불량' else 0)
        df['maint_cable'] = df['maint_cable'].apply(lambda x: 1 if x == '불량' else 0)
        df['maint_power'] = df['maint_power'].apply(lambda x: 1 if x == '불량' else 0)
        df['maint_update'] = pd.to_datetime(df['maint_update']).astype(int) // 10**9  # 타임스탬프 변환

        X = df[['maint_qr', 'maint_cable', 'maint_power']]
        y = df['maint_update'].apply(lambda x: 1 if x else 0)  # 점검이 완료되었으면 1, 아니면 0

        logging.info("Data preprocessed successfully.")
        return X, y
    except Exception as e:
        logging.error(f"Error during data preprocessing: {e}")
        raise

def train_model(X, y):
    logging.info("Training model...")
    try:
        # 데이터셋을 학습 및 테스트로 분리
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # 랜덤 포레스트 모델 학습
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)

        # 모델 평가
        accuracy = model.score(X_test, y_test)
        logging.info(f"Model accuracy: {accuracy * 100:.2f}%")

        return model
    except Exception as e:
        logging.error(f"Error during model training: {e}")
        raise

def save_model(model, file_path):
    logging.info(f"Saving model to {file_path}...")
    try:
        # 모델 저장
        with open(file_path, 'wb') as file:
            pickle.dump(model, file)
        logging.info("Model saved successfully.")
    except Exception as e:
        logging.error(f"Error saving model: {e}")
        raise

def main():
    logging.info("Starting model training process.")
    try:
        # 전체 워크플로우 실행
        data = load_data_from_db()
        X, y = preprocess_data(data)
        model = train_model(X, y)
        save_model(model, 'ai_model/model.pkl')

        logging.info("Model training process completed successfully.")
    except Exception as e:
        logging.error(f"Process failed: {e}")

if __name__ == "__main__":
    main()