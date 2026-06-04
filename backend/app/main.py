from fastapi import FastAPI

app = FastAPI(title="Talvix API")


@app.get("/")
def root():
    return {"message": "Talvix API Running"}