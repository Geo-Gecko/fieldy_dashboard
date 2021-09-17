import React from 'react';

import { Modal } from 'react-bootstrap';
import ndvi_image from '../ndvi_image.png';

export const IndicatorInformation = ({ showKatorInfo, setShowKatorInfo }) => {


  return (
    <Modal
      show={showKatorInfo}
      onHide={() => setShowKatorInfo(false)}
      aria-labelledby="contained-modal-title-vcenter"
      size="lg"
      centered
    >
      <style type="text/css">
        {`
      .modal {
        z-index: 19999;
      }
      `}
      </style>

      <Modal.Title className="text-center">
        <h1>Indicator Information</h1>
      </Modal.Title>
      <Modal.Body className="text-left">

        <p>
          The data used in the smallholder portal is generated from the European Space Agency’s (ESA’s)
          sentinel mission and the aWhere platform. A description of the data-sets is provided below:
          <br /><br /> <strong>Plant health indicator (NDVI)</strong><br />
          This is an indicator used to measure the state of plant health based on how the plant reflects light at
          certain frequencies. Plant health indicator values range from -1 to +1.
          A simplified scale summarizing the different ranges of the plant health indicator values is provided
          in the figure below. Crop monitoring uses this scale to show farmers which parts of their fields have
          dense, moderate, or sparse vegetation at any given moment.
          <img className="mx-auto d-block" alt="indicator information" src={ndvi_image}
            title="" />
          <br /><br /> <strong>Rainfall</strong><br />
          This is the amount of precipitation, in the form of rain, that descends
          onto the surface of Earth, whether it is on land or water. Precipitation, especially rain,
          is extremely important for agriculture. All crops require water to survive and develop.
          While a regular rain pattern is usually vital to healthy crops, too much or too little rainfall
          can be harmful, even devastating to crops. Drought can kill crops, while overly wet weather
          can prevent fieldwork, cause erosion, or facilitate the growth of harmful fungus.
          Precipitation can also be spatially variable, where large differences can often occur across
          small distances. Therefore, precipitation is one of the more important meteorological parameters
          to consider when monitoring crops. For rainfall, the Climate Hazards Group InfraRed Precipitation
          with Station data (CHIRPS), provided by UCSB/CHG, is used. CHIRPS is a 30+ year quasi-global
          rainfall dataset. It is available from 1981-01-01T00:00:00 - 2020-12-31T00:00:00.
          CHIRPS incorporates 0.05° resolution satellite imagery with in-situ station data to create
          gridded rainfall time series for trend analysis and seasonal drought monitoring.
          <br /><br /> <strong>Evapotranspiration</strong><br />
          Evapotranspiration is the sum of evaporation from the land surface plus the transpiration from plants.
          Transpiration is generally the evaporation of water from plant leaves.
          Crops draw water and nutrients up from the soil into the stems and leaves.
          Some of this water is released into the air as water vapor by transpiration.
          Energy is required to change the water inside the leaves from liquid to vapor.
          Direct solar radiation and, to a lesser extent, the ambient air temperature provide this energy.
          Transpiration rates also vary widely depending on additional environmental conditions, such as
          humidity, precipitation, soil type, soil moisture, wind, and land slope. During dry periods,
          transpiration can contribute to the loss of moisture in the top layer of soil where the roots
          are located, which can have a negative effect on crops.
          <br /><br /> <strong>Surface temperature</strong><br />
          Surface temperature is the temperature at or near the ground. Temperature is a major factor in
          affecting the rate of agricultural crop development. All biological and chemical processes
          taking place in crops and the soil are connected with air temperature. Crop growth takes place
          within a broad set of temperature limits. At the lower limit is the minimal temperature allowable
          for crop growth to begin, which is typically just a bit higher than freezing. While at the upper
          limit is the maximum temperature where crop growth stops and can cause irreversible damage to
          crop function or development, which can vary depending on the specific crop. Temperature swings
          in either direction, as either a frost or a heatwave, during the growing season can cause crop
          losses or reductions in yields. From the data source, the surface temperature is available from
          1948-01-01T00:00:00 - 2021-01-24T00:00:00, provided by the
          National Center for Environmental Prediction (NCEP)/ National Center for Atmospheric Research (NCAR).
          The data have a 6-hour temporal resolution (0000, 0600, 1200, and 1800 UTC) and 2.5 degree spatial resolution.
          <br /><br /> <strong>Soil moisture indicator (NDWI)</strong><br />
          Surface soil moisture is an important variable for crop growth and is the measurement of the amount
          of water stored in the soil on the surface of the soil particles, as well as in the pores between
          individual soil particles. The amount of moisture in the soil will depend on meteorological conditions
          (rain, heat, sun exposure, and wind), runoff/drainage, and soil type (which dictates the size of the pores).
          If there is less water in the soil, it will be more difficult for crop roots to take up that water,
          resulting in a crop that is under greater stress. If the stress continues, the crop will wilt and
          eventually die. However, if the soil is above field capacity and the pores are oversaturated with
          water then oxygen levels are restricted and it can be detrimental for the crop.
          The NDWI is a remote sensing based indicator sensitive to the change in the soil moisture content. NDWI varies between -1 to +1, depending on the leaf water content and also on the vegetation type and cover. High values of NDWI correspond to high vegetation water content and to high vegetation fraction cover. Low NDWI values correspond to low vegetation water content and low vegetation fraction cover. In periods of water stress, NDWI will decrease.

        </p>

      </Modal.Body>
    </Modal >
  )
}
