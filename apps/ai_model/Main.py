from DataManager import DataManager
from PredictiveMaintenanceModel import PredictiveMaintenanceModel
import logging

# 데이터 관리 객체 생성 및 데이터 로드
data_manager = DataManager()
data_manager.load_data_from_db()

# 데이터 전처리
data_manager.preprocess_data()

# 추천 데이터 확인
recommendations = data_manager.get_recommendations()

if recommendations.empty:
    print("추천할 데이터가 없습니다.")
else:
    # 머신러닝 모델 객체 생성 및 데이터 준비
    model = PredictiveMaintenanceModel(recommendations)
    model.prepare_data()
    model.train_model()
    model.evaluate_model()

    # 전체 데이터에 대해 예측 수행 및 유지보수 필요 여부 결정
    predictions = model.predict(data_manager.data[['maint_qr', 'maint_cable', 'maint_power']])

    # 결과 확인 (유지보수 제안 없이 결과 출력)
    print(data_manager.data[['cable_idx']])