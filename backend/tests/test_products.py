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


def test_shopping_generate_and_buy():
    from app.main import app
    from fastapi.testclient import TestClient
    client = TestClient(app)
    # create low stock product
    r = client.post("/products/", json={"name": "Eggs", "quantity": 1, "unit": "pcs", "min_stock": 6})
    assert r.status_code == 200
    r2 = client.post("/shopping/generate")
    assert r2.status_code == 200
    r3 = client.get("/shopping/")
    assert r3.status_code == 200
    items = r3.json()
    assert any(i["name"] == "Eggs" and i["source"] == "low_stock" for i in items)
    # buy
    egg_item = [i for i in items if i["name"] == "Eggs"][0]
    r4 = client.post(f"/shopping/buy/{egg_item['id']}")
    assert r4.status_code == 200
