import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';

import axiosInstance from '../../actions/axiosInstance';
import {
  getPolygonLayers, postPolygonLayer, updatePolygonLayer, deletePolygonLayer
} from '../../actions/layerActions';
import { GET_LAYERS_SUCCESS, GET_LAYERS_FAIL } from '../../actions/types';

describe("layerAction", () => {
  let store, mock, mockRealAxios, response_data;
  // const flushAllPromises = () => new Promise(resolve => setImmediate(resolve));

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance);
    mockRealAxios = new MockAdapter(axios);
    const mockStore = configureMockStore([thunk]);
    store = mockStore({});
    response_data = {
      "type": "Feature",
      "properties": {
        "field_id": "f3e240ef-6633-4ef1-9744-933ad89e6ec8",
        "field_attributes": {"CropType": "Pyrethrum", "size": 0.125}
      },
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [[[
          [33.350955084235792, -9.202944337613419], [33.350955084235792, -9.202855662381035],
          [33.351044915764199, -9.202855662381035], [33.351044915764199, -9.202944337613419],
          [33.350955084235792, -9.202944337613419]
        ]]] 
      }
    };
  });

  it('should get polygonlayers', async () => {
    response_data = {
    "type": "FeatureCollection",
    "name": "daisy_data",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    "features": [response_data]
  };
    mock.onGet(`/layers/listcreatepolygonlayer/`).reply(200, response_data);
    store.dispatch(getPolygonLayers())
      .then(() => {
        expect(store.getActions()).toEqual([{
          payload: {LayersPayload: response_data, cropTypes: ["Pyrethrum"]},
          type: GET_LAYERS_SUCCESS
        }]);
      });
  });

  it('should not get polygonlayers when not authenticated', async () => {
    mock.onGet(`layers/listcreatepolygonlayer/`).reply(403, {});
    store.dispatch(getPolygonLayers())
      .catch(() => {
        expect(store.getActions()).toEqual([{
          payload: {}, type: GET_LAYERS_FAIL
        }]);
      });
  });

  it('should post a polygonlayer when authenticated', async () => {
    mock.onPost(`layers/listcreatepolygonlayer/`).reply(201, response_data);
    const postPolygonLayerRes = postPolygonLayer(response_data)
    expect(postPolygonLayerRes).resolves.toEqual({"Layer saved": response_data});
  });

  it('should not post a polygonlayer when not authenticated', async () => {
    mock.onPost(`layers/listcreatepolygonlayer/`).reply(403, response_data);
    const postPolygonLayerRes = postPolygonLayer(response_data, "f3e240ef-6633-4ef1-9744-933ad89e6ec8")
    expect(postPolygonLayerRes).resolves.toEqual({error: "was unable to create layer"});
  });

  it('should update a polygonlayer when authenticated', async () => {
    mock.onPut(
      `layers/getupdatedeletelayer/${response_data.properties.field_id}/`,
      response_data
    ).reply(201, response_data);
    const postPolygonLayerRes = updatePolygonLayer(response_data)
    expect(postPolygonLayerRes).resolves.toEqual({"Layer updated": response_data});
  });

  it('should not update a polygonlayer when not authenticated', async () => {
    mock.onPut(
      `layers/getupdatedeletelayer/${response_data.properties.field_id}/`,
      response_data
    ).reply(403, response_data);
    const postPolygonLayerRes = updatePolygonLayer(response_data)
    expect(postPolygonLayerRes).resolves.toEqual({error: "layer could not be updated"});
  });

  it('should delete a polygonlayer when authenticated', async () => {
    mock.onDelete(
      `layers/getupdatedeletelayer/${response_data.properties.field_id}/`
      ).reply(204, response_data);
    const postPolygonLayerRes = deletePolygonLayer(
      response_data.properties.field_id, response_data
    )
    expect(postPolygonLayerRes).resolves.toEqual("Layer has been deleted");
  });

  it('should not delete a polygonlayer when not authenticated', async () => {
    // await flushAllPromises();
    mock.onDelete(
      `layers/getupdatedeletelayer/${response_data.properties.field_id}/`
      ).reply(403, response_data);
    const postPolygonLayerRes = deletePolygonLayer(
      response_data.properties.field_id, response_data
    )
    expect(postPolygonLayerRes).resolves.toEqual({error: "unable to delete layer"});
  });
})
