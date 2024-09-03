# import openai

# class MaintenanceAdvisor:
#     def __init__(self, api_key):
#         self.api_key = api_key  # 전달된 API 키를 저장
#         openai.api_key = self.api_key  # OpenAI 라이브러리에 API 키 설정

#     def generate_advice(self, usage_time, predicted_fault):
#         """유지보수 제안을 생성합니다."""
#         if predicted_fault == 1:
#             prompt = f"장비의 사용 시간이 {usage_time}시간으로 누적되었습니다. 예측에 따르면 고장이 발생할 가능성이 있습니다. 유지보수를 권장합니다."
#         else:
#             prompt = f"장비의 사용 시간이 {usage_time}시간으로 누적되었습니다. 예측에 따르면 현재 고장이 발생할 가능성은 낮습니다. 지속적인 모니터링을 권장합니다."

#         response = openai.ChatCompletion.create(
#             model="gpt-4",
#             messages=[
#                 {"role": "system", "content": "You are a helpful assistant."},
#                 {"role": "user", "content": prompt},
#             ]
#         )

#         return response['choices'][0]['message']['content'].strip()
