from flask import Flask , render_template

app = Flask(__name__)


# 데이터 (사용자들)
users = [
    {"id" : 1, "name" : "test1"},
    {"id" : 2, "name" : "test2"},
]

@app.route("/")
def home():
    return render_template("index.html");




    # GET 요청 처리
@app.route("/api/users", methods=['GET'])
def get_users():
    return render_template("index.html", userlist = users)

if __name__ == "__main__":
    app.run(debug=True)