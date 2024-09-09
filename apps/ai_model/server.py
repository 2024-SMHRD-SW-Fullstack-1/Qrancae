from flask import Flask, jsonify, request
from flask_cors import CORS
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
        recommendations = []
        for index, row in data_manager.data.iterrows():
            # predictions[index]가 1이고 recommend가 True인 경우에만 추가
            if row['recommend']: 
                recommendation = {
                    "cable_idx": row['cable_idx'],
                    "s_rack_number": row['s_rack_number'],
                    "s_rack_location": row['s_rack_location'],
                    "s_port_number": row['s_port_number'],
                    "maint_advice": "추천"
                }
                recommendations.append(recommendation)

        print("추천된 케이블 목록:", recommendations)  # 서버에서 제대로 추천이 생성되는지 확인

        # 결과 반환
        return jsonify(recommendations), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500


# maint_advice 업데이트를 위한 엔드포인트 추가
@app.route('/updateAdvice', methods=['POST'])
def update_advice():
    try:
        data = request.get_json()
        cable_idx = data.get('cable_idx')
        advice = '추천'

        data_manager = DataManager()
        data_manager.update_advice(cable_idx, advice)

        return jsonify({"status": "success"}), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == '__main__':
    app.run(port=5000, debug=True)