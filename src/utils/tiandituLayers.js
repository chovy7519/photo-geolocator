import L from 'leaflet';

/**
 * 天地图底图类型
 */
export const BASE_LAYERS = {
  矢量: { layer: 'vec', 名称: '矢量地图' },
  卫星: { layer: 'img', 名称: '卫星影像' },
  地形: { layer: 'ter', 名称: '地形图' },
};

/**
 * 天地图标注层类型
 */
export const ANNO_LAYERS = {
  矢量: { layer: 'cva', 名称: '中文注记' },
  卫星: { layer: 'cia', 名称: '影像注记' },
  地形: { layer: 'cta', 名称: '地形注记' },
};

/**
 * 天地图子域名
 */
const SUBDOMAINS = ['0', '1', '2', '3', '4', '5', '6', '7'];

/**
 * 创建天地图 WMTS 瓦片图层
 * @param {string} key - 天地图 API Key
 * @param {string} type - 图层类型 (vec/img/ter/cva/cia/cta)
 * @param {string} 名称 - 图层显示名称
 * @returns {L.TileLayer}
 */
function createTiandituLayer(key, type, 名称) {
  return L.tileLayer(
    `https://t{s}.tianditu.gov.cn/${type}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${type}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${key}`,
    {
      subdomains: SUBDOMAINS,
      minZoom: 1,
      maxZoom: 18,
      tms: false,
      attribution: '&copy; <a href="https://www.tianditu.gov.cn/" target="_blank">天地图</a>',
      名称,
    }
  );
}

/**
 * 创建所有天地图图层
 * @param {string} key - 天地图 API Key
 * @returns {{ 底图: Object, 标注: Object }}
 */
export function createLayers(key) {
  const 底图 = {};
  const 标注 = {};

  for (const [bk, bv] of Object.entries(BASE_LAYERS)) {
    底图[bk] = createTiandituLayer(key, bv.layer, bv.名称);
  }

  for (const [ak, av] of Object.entries(ANNO_LAYERS)) {
    标注[ak] = createTiandituLayer(key, av.layer, av.名称);
  }

  return { 底图, 标注 };
}

/**
 * 创建默认的地图视图中心（中国中心）
 */
export const DEFAULT_CENTER = [35.86, 104.19];
export const DEFAULT_ZOOM = 5;
