// Navin K. 2021

const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const smooth = require('chaikin-smooth');
const nicePalettes = require('nice-color-palettes');

//Tweak these to taste
//color settings
const myPalette = ["#22223b", "#4a4e69", "#9a8c98","#c9ada7","#f2e9e4"];
const useNicePalette = false;
const switchStroke = true;
//positioning and sizing of lines
const res = 2048;
const margin = 0;
const vertOffset = 50;
//settings for circular mask (recommend setting margin to 0)
const mask = true;
const radius = 900;
//other qualities
const lineCount = 180;
const noiseFactor = 0.2;
const lineWidth = 4;
const strokeChange = 2*res/3;

const sketch = () =>
{
    //determine colours
    shuffledPalette = useNicePalette ? random.shuffle(random.pick(nicePalettes)) 
                                     : random.shuffle(myPalette)

    const fillStyle = shuffledPalette[0];
    const strokeStyleTop = shuffledPalette[1];
    const strokeStyleBottom = shuffledPalette[2];

    if (useNicePalette) console.log(shuffledPalette);

    //Construct grid of lines, modulate vertical position
    //of each point in each line based on random noise
    const makeLines = () =>
    {
      const lines = [];
      for (let y = 0; y < lineCount; y++)
      {
        const v = lineCount <= 1 ? 0.5 : y/(lineCount - 1);
        const pointsInLine = [];
          for (let x = 0; x < lineCount; x++)
          {
            const u = lineCount <= 1 ? 0.5 : x/(lineCount - 1);
            pointsInLine.push([u,(v + Math.abs(random.noise2D(u,v)*noiseFactor))]);
          }
          lines[y] = pointsInLine;
      }
      return lines;
    };

    const myLines = makeLines();

    return ({ context, width, height }) =>
    {
        context.fillStyle = fillStyle;
        context.fillRect(0, 0, width, height);
        
        context.strokeStyle = strokeStyleTop;
        context.lineWidth = lineWidth;
        context.lineCap = "round";

        myLines.forEach(function(thisLine)
        {

          //modify positions of points based on margin
          var lineToDraw = [];
          thisLine.forEach(function([x,y])
          {
            lineToDraw.push([lerp(margin, width - margin, x),
                             lerp(margin, height - margin, y)]);
          });
          
          //apply vertical offset and double-smooth the curves
          lineToDraw.forEach(pt => pt[1] += vertOffset);
          var smoothLine = smooth(smooth(lineToDraw));

          //dont forget to, uh, actually draw the lines
          context.beginPath();
          context.moveTo(smoothLine[0][0], smoothLine[0][1]);
          smoothLine.forEach(function([x,y])
          {
            context.lineTo(x,y);
            if (y > strokeChange && switchStroke) context.strokeStyle = strokeStyleBottom;
          });
          context.stroke();
        });

        //create circular mask by drawing rect and then drawing circle with arc()
        //fill() will fill in area between rect and circle
        context.beginPath();
        context.arc(width/2, height/2, radius, 0, 2*Math.PI );
        context.rect(2048, 0, -2048, 2048);
        if (mask) context.fill();
    };
};

canvasSketch( sketch, {dimensions: [res, res]} );