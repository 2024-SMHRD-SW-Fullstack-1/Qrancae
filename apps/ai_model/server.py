from flask import Flask, jsonify
from flask_cors import CORS
# from MaintenanceAdvisor import MaintenanceAdvisor
from DataManager import DataManager
from PredictiveMaintenanceModel import PredictiveMaintenanceModel

app = Flask(__name__)
CORS(app)

@app.route('/runMaintenanceAdvisor', methods=['GET'])
def run_maintenance_advisor():
    try:
        # 데이터 로드 및 전처리
        data_manager = DataManager()
        data_manager.load_data_from_db()
        data_manager.preprocess_data()

        # 모델 학습 및 예측 수행
        model = PredictiveMaintenanceModel(data_manager.data)
        model.prepare_data()
        model.train_model()
        predictions = model.predict(data_manager.data[['maint_qr', 'maint_cable', 'maint_power']])
        
        # 유지보수 추천 생성
        # advisor = MaintenanceAdvisor(api_key='sk-xg7d3GD1jZRJtL3wEFJXJ_7Wq_SomqJReTD3KW4JK2T3BlbkFJdnsd7XNtDUstattuN8gfohZotRHIz5gbhF4rjoirYA')
        # recommendations = []
        # for index, row in data_manager.data.iterrows():
        #     recommendation = {
        #         "cable_idx": row['cable_idx'],
        #         "maint_advice": advisor.generate_advice(row['maint_update'], predictions[index])
        #     }
        #     recommendations.append(recommendation)

        # 간단한 조건문으로 유지보수 제안을 생성
        recommendations = []
        for index, row in data_manager.data.iterrows():
            if predictions[index] == 1:  # 모델이 점검이 필요하다고 예측한 경우
                recommendation = {
                    "cable_idx": row['cable_idx'],
                    "maint_advice": "추천"
                }
                recommendations.append(recommendation)

        # 결과 반환
        return jsonify(recommendations), 200

    except Exception as e:
         # 오류 메시지 출력
        print(f"Error: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
