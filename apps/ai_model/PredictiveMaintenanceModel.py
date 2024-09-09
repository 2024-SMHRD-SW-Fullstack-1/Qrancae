from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

class PredictiveMaintenanceModel:
    def __init__(self, data):
        self.data = data
        self.model = RandomForestClassifier(random_state=42)
        self.X_train, self.X_test, self.y_train, self.y_test = None, None, None, None

    def prepare_data(self):
        """데이터를 특성과 라벨로 분리하고, 학습/테스트 데이터셋으로 나눕니다."""
        X = self.data[['maint_qr', 'maint_cable', 'maint_power']]  # 필요에 따라 확장 가능
        y = self.data['recommend']
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    def train_model(self):
        """모델을 학습하고, 최적의 하이퍼파라미터를 찾습니다."""
        param_grid = {
            'n_estimators': [50, 100],  # 범위를 줄임
            'max_depth': [None, 10],  # 범위를 줄임
            'min_samples_split': [2, 5]  # 범위를 줄임
        }
        grid_search = GridSearchCV(self.model, param_grid, cv=3)
        grid_search.fit(self.X_train, self.y_train)

        # 최적의 모델로 업데이트
        self.model = grid_search.best_estimator_
        print(f'최적의 하이퍼파라미터: {grid_search.best_params_}')

    def evaluate_model(self):
        """모델의 성능을 평가합니다."""
        y_pred = self.model.predict(self.X_test)
        accuracy = accuracy_score(self.y_test, y_pred)
        print(f'모델 정확도: {accuracy * 100:.2f}%')

        # 추가적인 성능 지표 출력 (Precision, Recall, F1-Score)
        print("분류 보고서:")
        print(classification_report(self.y_test, y_pred, target_names=["정상", "불량"]))

    def predict(self, new_data):
        """새로운 데이터를 바탕으로 예측을 수행합니다."""
        return self.model.predict(new_data)
