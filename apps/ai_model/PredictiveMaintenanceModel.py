from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

class PredictiveMaintenanceModel:
    def __init__(self, data):
        self.data = data
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.X_train, self.X_test, self.y_train, self.y_test = None, None, None, None

    def prepare_data(self):
        """데이터를 특성과 라벨로 분리하고, 학습/테스트 데이터셋으로 나눕니다."""
        X = self.data[['maint_qr', 'maint_cable', 'maint_power']]
        y = self.data['recommend']
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    def train_model(self):
        """모델을 학습합니다."""
        self.model.fit(self.X_train, self.y_train)

    def evaluate_model(self):
        """모델의 성능을 평가합니다."""
        y_pred = self.model.predict(self.X_test)
        accuracy = accuracy_score(self.y_test, y_pred)
        print(f'모델 정확도: {accuracy * 100:.2f}%')

    def predict(self, new_data):
        """새로운 데이터를 바탕으로 예측을 수행합니다."""
        return self.model.predict(new_data)
