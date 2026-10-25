from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_mark_out_of_stock_adds_to_shopping():
    from app.main import app
    from fastapi.testclient import TestClient
    client = TestClient(app)
    # create product
    r = client.post("/products/", json={"name": "Milk", "quantity": 1, "unit": "L", "min_stock": 2})
    assert r.status_code == 200
    pid = r.json()["id"]
    r2 = client.post(f"/products/{pid}/out_of_stock")
    assert r2.status_code == 200
    # check shopping list
    r3 = client.get("/shopping/")
    assert r3.status_code == 200
    items = r3.json()
    assert any(i["product_id"] == pid and i["source"] == "out_of_stock" for i in items)
