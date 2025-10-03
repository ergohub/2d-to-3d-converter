import {
    DPTForDepthEstimation,
    AutoProcessor,
    RawImage,
    interpolate_4d,
} from "@huggingface/transformers";

export const modelPrediction = async (file) => {
    const model_id = 'Xenova/dpt-hybrid-midas';
    const model = await DPTForDepthEstimation.from_pretrained(model_id);
    const processor = await AutoProcessor.from_pretrained(model_id)
    const image = await RawImage.read(file);

    // Prep image for model
    const inputs = await processor(image)

    // Run model
    const { predicted_depth } = await model(inputs)

    //Interpolate to original image
    const prediction = (await interpolate_4d(
        predicted_depth.unsqueeze(1),
        {
            size: image.size.reverse(),
            mode: 'bilinear',
            device: 'wasm',
            dtype: 'q8',
        }
    )).squeeze(1);

    // Visualise the prediction
    const min = prediction.min().item();
    const max = prediction.max().item();
    const formatted = prediction.sub_(min).div_(max - min).mul_(255).to('uint8');
    const depth = RawImage.fromTensor(formatted);
    return depth;
}