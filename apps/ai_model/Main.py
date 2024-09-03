from DataManager import DataManager
from PredictiveMaintenanceModel import PredictiveMaintenanceModel
from MaintenanceAdvisor import MaintenanceAdvisor

# API 키 설정
# api_key = 'sk-xg7d3GD1jZRJtL3wEFJXJ_7Wq_SomqJReTD3KW4JK2T3BlbkFJdnsd7XNtDUstattuN8gfohZotRHIz5gbhF4rjoirYA'

# 데이터 관리 객체 생성 및 데이터 로드
data_manager = DataManager()
data_manager.load_data_from_db()

# 데이터 전처리
data_manager.preprocess_data()

# 머신러닝 모델 객체 생성 및 데이터 준비
model = PredictiveMaintenanceModel(data_manager.get_recommendations())
model.prepare_data()
model.train_model()
model.evaluate_model()

# 전체 데이터에 대해 예측 수행 및 유지보수 필요 여부 결정
recommendations = model.predict(data_manager.data[['maint_qr', 'maint_cable', 'maint_power']])

# 유지보수 제안 생성
# advisor = MaintenanceAdvisor(api_key)
# data_manager.data['유지보수 제안'] = data_manager.data.apply(
#     lambda row: advisor.generate_advice(row['maint_update'], row['recommend']), axis=1)

# 결과 확인 (이 부분은 나중에 필요시 DB에 업데이트할 수 있습니다)
print(data_manager.data[['cable_idx', '유지보수 제안']])
